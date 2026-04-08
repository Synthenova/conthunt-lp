"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { ContentAction, ContentActionListResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ContentActionsPanel() {
    const [data, setData] = useState<ContentActionListResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedAction, setSelectedAction] = useState<ContentAction | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const response = await api.listContentActions({
                status: statusFilter !== "all" ? statusFilter : undefined,
                limit: 100
            })
            setData(response)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        void loadData()
    }, [loadData])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Content Logs</h2>
                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="proposed">Proposed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Brief</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.items.map((action) => (
                                <TableRow key={action.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(action.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{action.action_type}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        <span title={action.target_page_url || action.target_keyword || ""}>
                                            {action.target_page_url || action.target_keyword}
                                        </span>
                                    </TableCell>
                                    <TableCell>{action.priority_score.toFixed(1)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={action.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedAction(action)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!data?.items.length && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                        No actions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ActionDialog action={selectedAction} onClose={() => setSelectedAction(null)} />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        proposed: "secondary",
        approved: "default",
        done: "outline",
        rejected: "destructive",
        failed: "destructive",
    }
    return <Badge variant={colors[status] || "outline"}>{status}</Badge>
}

function ActionDialog({ action, onClose }: { action: ContentAction | null; onClose: () => void }) {
    if (!action) return null

    let brief = {}, evidence = {}
    try { brief = JSON.parse(action.brief_json) } catch { }
    try { evidence = JSON.parse(action.evidence_json) } catch { }

    return (
        <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{action.action_type.toUpperCase()}: {(action.target_keyword || "").substring(0, 50)}</DialogTitle>
                    <DialogDescription>
                        Created at {new Date(action.created_at).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">Target</h4>
                            <p className="text-sm break-all">{action.target_page_url || action.target_keyword}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Details</h4>
                            <div className="text-sm">
                                <div>Priority: {action.priority_score}</div>
                                <div>Status: {action.status}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Evidence</h4>
                        <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(evidence, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Brief</h4>
                        <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(brief, null, 2)}
                        </pre>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
