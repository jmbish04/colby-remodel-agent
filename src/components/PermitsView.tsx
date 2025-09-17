
"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface PermitHistory {
    id: number;
    permit_number: string;
    changed_field: string;
    old_value: string;
    new_value: string;
    change_date: string;
}

interface Permit {
    permit_number: string;
    permit_type: string;
    status: string;
    description: string;
    address: string;
    issue_date: string;
    estimated_cost: number;
    history: PermitHistory[];
}

const PermitsView: React.FC = () => {
    const [permits, setPermits] = useState<Permit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPermits = async () => {
            try {
                setIsLoading(true);
                const permitData = await apiClient.get<Permit[]>('/permits');
                setPermits(permitData);
            } catch (error) {
                console.error("Failed to fetch permits:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPermits();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Permit Monitoring</CardTitle>
                <CardDescription>Live permit data from SFGov, updated hourly.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Loading permits...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permit #</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Issued</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead className="text-center">History</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permits.map((permit) => (
                                <TableRow key={permit.permit_number}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            {permit.history && permit.history.length > 0 && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" title="Updated"></span>
                                            )}
                                            {permit.permit_number}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{permit.permit_type}</Badge></TableCell>
                                    <TableCell><Badge>{permit.status}</Badge></TableCell>
                                    <TableCell className="max-w-xs truncate">{permit.description}</TableCell>
                                    <TableCell>{permit.issue_date ? new Date(permit.issue_date).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>${permit.estimated_cost?.toLocaleString() || '0'}</TableCell>
                                    <TableCell className="text-center">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={!permit.history || permit.history.length === 0}>
                                                    View ({permit.history?.length || 0})
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[625px]">
                                                <DialogHeader>
                                                    <DialogTitle>Change History</DialogTitle>
                                                    <DialogDescription>
                                                        Showing all recorded changes for permit #{permit.permit_number}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Field</TableHead>
                                                                <TableHead>Old Value</TableHead>
                                                                <TableHead>New Value</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {permit.history.map(h => (
                                                                <TableRow key={h.id}>
                                                                    <TableCell>{new Date(h.change_date).toLocaleString()}</TableCell>
                                                                    <TableCell className="font-medium">{h.changed_field}</TableCell>
                                                                    <TableCell><Badge variant="secondary">{h.old_value || 'N/A'}</Badge></TableCell>
                                                                    <TableCell><Badge>{h.new_value || 'N/A'}</Badge></TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};

export default PermitsView;
