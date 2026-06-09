import { useState } from "react"
import { useFetchData } from "../hooks/useFetchData"
import { useNavigate } from "react-router-dom"
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { MdArrowDownward, MdArrowUpward, MdSwapVert } from "react-icons/md"
import { getTenants } from "../api/adminApi"
import './AdminTenantList.css'

const columns = [
    { accessorKey: 'name', header: 'Name' },
    {
        accessoryKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
            const status = getValue()
            return <span className={`tenant-status tenant-status--${status}`}>{status}</span>
        }
    }
]

function AdminTenantList() {
    const { data: tenants, loading, error } = useFetchData(() => getTenants().then(r => r.data))
    const [sorting, setSorting] = useState([{ id: 'name', desc: false }])
    const navigate = useNavigate()

    const tableInstance = useReactTable({
        columns,
        data: tenants ?? [],
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Failed to load tenants</div>
    }

    return (
        <div className="page admin-tenant-list">

            <h1>Tenants</h1>
            {(tenants ?? []).length === 0 ? (
                <div className="empty-state"><p>No. tenants found.</p></div>
            ) : (
                <table className="admin-tenant-table">
                    <thead>
                        {tableInstance.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === 'asc' ? <MdArrowUpward size={10} /> : header.column.getIsSorted() === 'desc' ? <MdArrowDownward size={10} /> : <MdSwapVert />}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {tableInstance.getRowModel().rows.map(row => (
                            <tr key={row.id} onClick={() => navigate(`/admin/tenants/${row.original.id}`)}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default AdminTenantList