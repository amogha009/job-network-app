"use client"

import * as React from "react"
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    CheckCircle2Icon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    ColumnsIcon,
    GripVerticalIcon,
    LoaderIcon,
    MoreVerticalIcon,
    PlusIcon,
    TrendingUpIcon,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

// Define the schema based on data_jobs table
export const dataJobSchema = z.object({
    id: z.number(),
    job_title_short: z.string().nullable(),
    job_title: z.string().nullable(),
    job_location: z.string().nullable(),
    job_via: z.string().nullable(),
    job_schedule_type: z.string().nullable(),
    job_work_from_home: z.boolean(),
    search_location: z.string(),
    job_posted_date: z.string(), // Keep as string for simplicity, format in cell
    job_no_degree_mention: z.boolean(),
    job_health_insurance: z.boolean(),
    job_country: z.string().nullable(),
    salary_rate: z.string().nullable(),
    salary_year_avg: z.number().nullable(),
    salary_hour_avg: z.number().nullable(),
    company_name: z.string().nullable(),
    job_skills: z.string().nullable(), // Keep as string, could parse if needed
    job_type_skills: z.string().nullable(), // Keep as string, could parse if needed
})

// Type for a single data job
type DataJob = z.infer<typeof dataJobSchema>

// Helper Components for Skill Badges (defined above or imported)
// import { SkillBadgeCell, TypeSkillBadgeCell } from './skill-badge-cells'; // Example if moved to separate file

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:bg-transparent"
        >
            <GripVerticalIcon className="size-3 text-muted-foreground" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

// Define new columns based on dataJobSchema
const columns: ColumnDef<DataJob>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-10">{row.getValue("id")}</div>,
        enableHiding: false,
    },
    {
        accessorKey: "job_title_short",
        header: "Job Title (Short)",
        cell: ({ row }) => <div>{row.getValue("job_title_short")}</div>,
    },
    {
        accessorKey: "job_title",
        header: "Job Title",
        cell: ({ row }) => <div className="font-medium">{row.getValue("job_title")}</div>,
    },
    {
        accessorKey: "job_location",
        header: "Location",
        cell: ({ row }) => <div>{row.getValue("job_location")}</div>,
    },
    {
        accessorKey: "job_via",
        header: "Via",
        cell: ({ row }) => <div>{row.getValue("job_via")}</div>,
    },
    {
        accessorKey: "job_schedule_type",
        header: "Schedule",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("job_schedule_type")}</Badge>,
    },
    {
        accessorKey: "job_work_from_home",
        header: "WFH",
        cell: ({ row }) => <div className="text-center">{row.getValue("job_work_from_home") ? "Yes" : "No"}</div>,
    },
    {
        accessorKey: "search_location",
        header: "Search Location",
        cell: ({ row }) => <div>{row.getValue("search_location")}</div>,
    },
    {
        accessorKey: "job_posted_date",
        header: "Date Posted",
        cell: ({ row }) => {
             const date = new Date(row.getValue("job_posted_date"));
             const formatted = date.toLocaleDateString("en-US", {
                year: 'numeric', month: 'short', day: 'numeric'
             });
             return <div className="min-w-[100px]">{formatted}</div>;
        }
    },
    {
        accessorKey: "job_no_degree_mention",
        header: "No Degree Mention",
        cell: ({ row }) => <div className="text-center">{row.getValue("job_no_degree_mention") ? "Yes" : "No"}</div>,
    },
    {
        accessorKey: "job_health_insurance",
        header: "Health Insurance",
        cell: ({ row }) => <div className="text-center">{row.getValue("job_health_insurance") ? "Yes" : "No"}</div>,
    },
    {
        accessorKey: "job_country",
        header: "Country",
        cell: ({ row }) => <div>{row.getValue("job_country")}</div>,
    },
    {
        accessorKey: "salary_rate",
        header: "Salary Rate",
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("salary_rate") ?? 'N/A'}</Badge>,
    },
    {
        accessorKey: "salary_year_avg",
        header: "Salary (Year Avg)",
        cell: ({ row }) => {
            const salary = row.getValue("salary_year_avg") as number | null;
            return <div className="text-right min-w-[100px]">{salary ? `$${salary.toLocaleString()}` : 'N/A'}</div>;
        }
    },
    {
        accessorKey: "salary_hour_avg",
        header: "Salary (Hour Avg)",
        cell: ({ row }) => {
            const salary = row.getValue("salary_hour_avg") as number | null;
            return <div className="text-right min-w-[100px]">{salary ? `$${salary.toFixed(2)}` : 'N/A'}</div>;
        }
    },
    {
        accessorKey: "company_name",
        header: "Company",
        cell: ({ row }) => <div>{row.getValue("company_name")}</div>,
    },
    {
        accessorKey: "job_skills",
        header: "Skills",
        cell: ({ row }) => <SkillBadgeCell skillsString={row.getValue("job_skills")} />,
    },
    {
        accessorKey: "job_type_skills",
        header: "Type Skills",
        cell: ({ row }) => <TypeSkillBadgeCell typeSkillsString={row.getValue("job_type_skills")} />,
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                        size="icon"
                    >
                        <MoreVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

function DraggableRow({ row }: { row: Row<DataJob> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

// Interface for DataTable props including pagination
interface DataTableProps {
    data: DataJob[]
    pageCount: number
    totalCount: number
    currentPage: number
    pageSize: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export function DataTable({
    data,
    pageCount,
    totalCount,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: DataTableProps) {
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])

    const pagination = React.useMemo(() => ({
        pageIndex: currentPage - 1,
        pageSize,
    }), [currentPage, pageSize])

    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )
    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        manualPagination: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updaterOrValue) => {
            let newPageIndex: number;
            let newPageSize: number;

            if (typeof updaterOrValue === 'function') {
                const newState = updaterOrValue(table.getState().pagination);
                newPageIndex = newState.pageIndex;
                newPageSize = newState.pageSize;
            } else {
                newPageIndex = updaterOrValue.pageIndex;
                newPageSize = updaterOrValue.pageSize;
            }

            if (newPageSize !== pageSize) {
                onPageSizeChange(newPageSize);
            }
            if (newPageIndex !== pagination.pageIndex) {
                onPageChange(newPageIndex + 1);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            console.warn("Drag-and-drop finished but data state is managed externally. Implement callback prop to update data order.")
        }
    }

    return (
        <Tabs
            defaultValue="outline"
            className="flex w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <Label htmlFor="view-selector" >
                    Data Table
                </Label>
                <div className="flex items-center gap-2 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ColumnsIcon />
                                <span className="hidden lg:inline">Customize Columns</span>
                                <span className="lg:hidden">Columns</span>
                                <ChevronDownIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <TabsContent
                value="outline"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-between px-4">
                    <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                        {totalCount} row(s) total.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Rows per page
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    onPageSizeChange(Number(value))
                                }}
                            >
                                <SelectTrigger className="w-20" id="rows-per-page">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent
                value="past-performance"
                className="flex flex-col px-4 lg:px-6"
            >
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent
                value="focus-documents"
                className="flex flex-col px-4 lg:px-6"
            >
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    )
}

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies ChartConfig

// --- Skill Badge Helper Components --- START ---
// (Paste the SkillBadgeCell and TypeSkillBadgeCell component code here)
import { useState } from "react"

interface SkillBadgeCellProps {
    skillsString: string | null
    limit?: number
}

function SkillBadgeCell({ skillsString, limit = 4 }: SkillBadgeCellProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!skillsString) return <div className="text-muted-foreground">N/A</div>

    let skills: string[] = []
    try {
        const jsonString = skillsString.replace(/'/g, '"')
        skills = JSON.parse(jsonString)
        if (!Array.isArray(skills)) {
            skills = []
        }
    } catch (error) {
        console.error("Failed to parse skills:", skillsString, error)
        return (
            <div className="text-red-500 text-xs" title={skillsString}>
                Invalid format
            </div>
        )
    }

    if (skills.length === 0) {
        return <div className="text-muted-foreground">None</div>
    }

    const displayedSkills = isExpanded ? skills : skills.slice(0, limit)
    const remainingCount = skills.length - limit

    return (
        <div className="flex flex-wrap gap-1 items-center max-w-xs">
            {displayedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="whitespace-nowrap">
                    {skill}
                </Badge>
            ))}
            {!isExpanded && remainingCount > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground"
                    onClick={() => setIsExpanded(true)}
                >
                    +{remainingCount} more
                </Button>
            )}
            {isExpanded && remainingCount > 0 && (
                 <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground"
                    onClick={() => setIsExpanded(false)}
                >
                    Show less
                </Button>
            )}
        </div>
    )
}

interface TypeSkillBadgeCellProps {
    typeSkillsString: string | null
    limit?: number
}

function TypeSkillBadgeCell({ typeSkillsString, limit = 4 }: TypeSkillBadgeCellProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!typeSkillsString) return <div className="text-muted-foreground">N/A</div>

    let typeSkills: Record<string, string[]> = {}
    try {
        const jsonString = typeSkillsString.replace(/'/g, '"')
        typeSkills = JSON.parse(jsonString)
        if (typeof typeSkills !== "object" || typeSkills === null) {
            typeSkills = {}
        }
    } catch (error) {
        console.error("Failed to parse type skills:", typeSkillsString, error)
        return (
            <div className="text-red-500 text-xs" title={typeSkillsString}>
                Invalid format
            </div>
        )
    }

    const entries = Object.entries(typeSkills);
    if (entries.length === 0) {
        return <div className="text-muted-foreground">None</div>;
    }

    const allBadges: { category: string; skill: string }[] = [];
    entries.forEach(([category, skills]) => {
        skills.forEach(skill => allBadges.push({ category, skill }));
    });

    const displayedBadges = isExpanded ? allBadges : allBadges.slice(0, limit);
    const remainingCount = allBadges.length - limit;

    // Group displayed badges back by category for rendering
    const groupedDisplayedBadges: Record<string, string[]> = {};
    displayedBadges.forEach(badge => {
        if (!groupedDisplayedBadges[badge.category]) {
            groupedDisplayedBadges[badge.category] = [];
        }
        groupedDisplayedBadges[badge.category].push(badge.skill);
    });
    const displayedEntries = Object.entries(groupedDisplayedBadges);


    return (
        <div className="flex flex-col gap-1 max-w-xs text-xs">
            {displayedEntries.map(([category, skills], index) => (
                <div key={index} className="flex flex-wrap gap-1 items-center">
                    <span className="font-medium capitalize">{category}:</span>
                    {skills.map((skill, skillIndex) => (
                        <Badge
                            key={skillIndex}
                            variant="outline"
                            className="whitespace-nowrap font-normal"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
            ))}
            {!isExpanded && remainingCount > 0 && (
                 <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground self-start mt-1"
                    onClick={() => setIsExpanded(true)}
                >
                    +{remainingCount} more
                </Button>
            )}
             {isExpanded && remainingCount > 0 && (
                 <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground self-start mt-1"
                    onClick={() => setIsExpanded(false)}
                >
                    Show less
                </Button>
            )}
        </div>
    );
}
// --- Skill Badge Helper Components --- END ---
