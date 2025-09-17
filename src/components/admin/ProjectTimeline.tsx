"use client";

import React, { useState } from "react";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttMarker,
  GanttToday,
  GanttCreateMarkerTrigger,
  type GanttFeature,
  type GanttMarker as GanttMarkerType,
} from "@/components/ui/shadcn-io/gantt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import groupBy from "lodash.groupby";

// Sample renovation project data
const statuses = [
  { id: "1", name: "Planned", color: "#6B7280" },
  { id: "2", name: "In Progress", color: "#F59E0B" },
  { id: "3", name: "Done", color: "#10B981" },
];

const contractors = [
  { id: "1", name: "Mike Johnson", image: "" },
  { id: "2", name: "Sarah Chen", image: "" },
  { id: "3", name: "Roberto Martinez", image: "" },
  { id: "4", name: "Lisa Wong", image: "" },
];

const projects = [
  { id: "1", name: "Kitchen Remodel" },
  { id: "2", name: "Bathroom Renovation" },
  { id: "3", name: "Deck Addition" },
];

// Sample timeline features (tasks)
const initialFeatures: GanttFeature[] = [
  {
    id: "1",
    name: "Kitchen Demolition",
    startAt: new Date("2025-09-01"),
    endAt: new Date("2025-09-05"),
    status: statuses[1], // In Progress
    owner: contractors[0],
    group: projects[0],
  },
  {
    id: "2",
    name: "Electrical Rough-in",
    startAt: new Date("2025-09-06"),
    endAt: new Date("2025-09-12"),
    status: statuses[1], // In Progress
    owner: contractors[1],
    group: projects[0],
  },
  {
    id: "3",
    name: "Plumbing Rough-in",
    startAt: new Date("2025-09-13"),
    endAt: new Date("2025-09-20"),
    status: statuses[0], // Planned
    owner: contractors[2],
    group: projects[0],
  },
  {
    id: "4",
    name: "Tile Installation",
    startAt: new Date("2025-09-21"),
    endAt: new Date("2025-10-15"),
    status: statuses[0], // Planned
    owner: contractors[3],
    group: projects[0],
  },
  {
    id: "5",
    name: "Bathroom Planning",
    startAt: new Date("2025-09-15"),
    endAt: new Date("2025-09-25"),
    status: statuses[0], // Planned
    owner: contractors[0],
    group: projects[1],
  },
  {
    id: "6",
    name: "Bathroom Demo",
    startAt: new Date("2025-10-01"),
    endAt: new Date("2025-10-05"),
    status: statuses[0], // Planned
    owner: contractors[0],
    group: projects[1],
  },
];

// Sample milestones
const initialMarkers: GanttMarkerType[] = [
  {
    id: "1",
    date: new Date("2025-09-15"),
    label: "Kitchen Milestone",
    className: "bg-blue-100 text-blue-900",
  },
  {
    id: "2",
    date: new Date("2025-10-01"),
    label: "Bathroom Start",
    className: "bg-green-100 text-green-900",
  },
];

const ProjectTimeline = () => {
  const [features, setFeatures] = useState<GanttFeature[]>(initialFeatures);
  const [markers, setMarkers] = useState<GanttMarkerType[]>(initialMarkers);

  const groupedFeatures = groupBy(features, 'group.name');
  const sortedGroupedFeatures = Object.fromEntries(
    Object.entries(groupedFeatures).sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB)
    )
  );

  const handleViewFeature = (id: string) => {
    console.log(`Feature selected: ${id}`);
  };

  const handleMoveFeature = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.id === id ? { ...feature, startAt, endAt } : feature
      )
    );
    console.log(`Move feature: ${id} from ${startAt} to ${endAt}`);
  };

  const handleCreateMarker = (date: Date) => {
    const newMarker: GanttMarkerType = {
      id: Date.now().toString(),
      date,
      label: `Milestone ${markers.length + 1}`,
      className: "bg-purple-100 text-purple-900",
    };
    setMarkers((prev) => [...prev, newMarker]);
    console.log(`Create marker: ${date.toISOString()}`);
  };

  const handleRemoveMarker = (id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
    console.log(`Remove marker: ${id}`);
  };

  const handleAddFeature = (date: Date) => {
    console.log(`Add feature: ${date.toISOString()}`);
  };

  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Project Timeline</h2>
        <p className="text-muted-foreground">
          Visualize project tasks and milestones over time
        </p>
      </div>

      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <GanttProvider
            className="h-full"
            onAddItem={handleAddFeature}
            range="monthly"
            zoom={100}
          >
            <GanttSidebar>
              {Object.entries(sortedGroupedFeatures).map(([group, features]) => (
                <GanttSidebarGroup key={group} name={group}>
                  {features.map((feature) => (
                    <GanttSidebarItem
                      feature={feature}
                      key={feature.id}
                      onSelectItem={handleViewFeature}
                    />
                  ))}
                </GanttSidebarGroup>
              ))}
            </GanttSidebar>

            <GanttTimeline>
              <GanttHeader />
              <GanttFeatureList>
                {Object.entries(sortedGroupedFeatures).map(([group, features]) => (
                  <GanttFeatureListGroup key={group}>
                    {features.map((feature) => (
                      <GanttFeatureItem
                        key={feature.id}
                        onMove={handleMoveFeature}
                        {...feature}
                      >
                        <span className="truncate text-xs">{feature.name}</span>
                        {feature.owner && (
                          <span className="text-xs opacity-75 ml-1">
                            ({feature.owner.name.split(' ')[0]})
                          </span>
                        )}
                      </GanttFeatureItem>
                    ))}
                  </GanttFeatureListGroup>
                ))}
              </GanttFeatureList>

              {markers.map((marker) => (
                <GanttMarker
                  key={marker.id}
                  {...marker}
                  onRemove={handleRemoveMarker}
                />
              ))}

              <GanttToday />
              <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
            </GanttTimeline>
          </GanttProvider>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {features.filter(f => f.status?.name === 'In Progress').length} tasks in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.length}</div>
            <p className="text-xs text-muted-foreground">
              {features.filter(f => f.status?.name === 'Done').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{markers.length}</div>
            <p className="text-xs text-muted-foreground">
              Project checkpoints
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline Instructions</CardTitle>
            <CardDescription>
              This is a simplified Gantt chart for demonstration. In a full implementation, you could:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Drag task bars to adjust start and end dates</li>
              <li>Click anywhere on the timeline to add milestones</li>
              <li>Right-click tasks for context menus</li>
              <li>Connect task dependencies with arrows</li>
              <li>Zoom in/out for different time granularities</li>
              <li>Filter by project, contractor, or status</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectTimeline;
