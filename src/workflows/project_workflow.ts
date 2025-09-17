import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";

type Env = {
  PROJECT_WORKFLOW: WorkflowEntrypoint<Env, Params>;
  DB: D1Database;
  PROJECT_KV: KVNamespace;
};

type Params = {
  projectId: string;
  action: 'status_update' | 'budget_check' | 'deadline_reminder' | 'task_completion';
  metadata?: any;
};

export class ProjectWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { DB, PROJECT_KV } = this.env;
    const { projectId, action, metadata } = event.payload;

    const project = await step.do("fetch project", async () => {
      const resp = await DB.prepare(`SELECT * FROM projects WHERE id = ?`)
        .bind(projectId)
        .run();
      if (resp.success) return resp.results[0];
      return null;
    });

    if (!project) {
      console.log(`Project ${projectId} not found`);
      return;
    }

    switch (action) {
      case 'status_update':
        await step.do("handle status update", async () => {
          await this.updateProjectProgress(project, DB);
          console.log(`Updated progress for project: ${project.name}`);
        });
        break;

      case 'budget_check':
        await step.do("check budget", async () => {
          await this.checkBudgetStatus(project, DB, PROJECT_KV);
          console.log(`Checked budget for project: ${project.name}`);
        });
        break;

      case 'deadline_reminder':
        await step.do("send deadline reminder", async () => {
          await this.sendDeadlineReminder(project, PROJECT_KV);
          console.log(`Sent deadline reminder for project: ${project.name}`);
        });
        break;

      case 'task_completion':
        await step.do("handle task completion", async () => {
          await this.handleTaskCompletion(projectId, metadata, DB);
          console.log(`Handled task completion for project: ${project.name}`);
        });
        break;
    }

    await step.do("log activity", async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        projectId,
        action,
        metadata
      };
      await PROJECT_KV.put(`log:${projectId}:${Date.now()}`, JSON.stringify(logEntry));
    });
  }

  private async updateProjectProgress(project: any, DB: D1Database) {
    // Calculate progress based on completed tasks
    const tasksResp = await DB.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
      FROM tasks 
      WHERE project_id = ?
    `).bind(project.id).run();

    if (tasksResp.success && tasksResp.results[0]) {
      const { total_tasks, completed_tasks } = tasksResp.results[0] as any;
      const progress = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;
      
      await DB.prepare(`
        UPDATE projects 
        SET progress_percentage = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(progress, project.id).run();
    }
  }

  private async checkBudgetStatus(project: any, DB: D1Database, KV: KVNamespace) {
    // Calculate actual costs from tasks
    const costsResp = await DB.prepare(`
      SELECT COALESCE(SUM(actual_cost), 0) as total_actual_cost
      FROM tasks 
      WHERE project_id = ?
    `).bind(project.id).run();

    if (costsResp.success && costsResp.results[0]) {
      const { total_actual_cost } = costsResp.results[0] as any;
      const budgetUsagePercent = project.budget_amount > 0 
        ? (total_actual_cost / project.budget_amount) * 100 
        : 0;

      // Update project with actual costs
      await DB.prepare(`
        UPDATE projects 
        SET actual_cost = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(total_actual_cost, project.id).run();

      // Store budget alert if over 80%
      if (budgetUsagePercent > 80) {
        await KV.put(`budget_alert:${project.id}`, JSON.stringify({
          projectName: project.name,
          budgetUsagePercent,
          budgetAmount: project.budget_amount,
          actualCost: total_actual_cost,
          timestamp: new Date().toISOString()
        }));
      }
    }
  }

  private async sendDeadlineReminder(project: any, KV: KVNamespace) {
    const reminder = {
      projectId: project.id,
      projectName: project.name,
      endDate: project.end_date,
      daysRemaining: this.calculateDaysRemaining(project.end_date),
      timestamp: new Date().toISOString()
    };

    await KV.put(`reminder:${project.id}`, JSON.stringify(reminder));
  }

  private async handleTaskCompletion(projectId: string, taskMetadata: any, DB: D1Database) {
    if (taskMetadata?.taskId) {
      await DB.prepare(`
        UPDATE tasks 
        SET status = 'completed', completed_date = DATE('now'), updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND project_id = ?
      `).bind(taskMetadata.taskId, projectId).run();
    }
  }

  private calculateDaysRemaining(endDate: string): number {
    if (!endDate) return -1;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
