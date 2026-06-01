import { useState, useMemo } from 'react'
import { getStatements } from '../api/statementApi'
import { Link, useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import { MdArrowUpward, MdArrowDownward, MdSwapVert } from 'react-icons/md'
import { useFetchData } from '../hooks/useFetchData'
import { formatDate } from '../utils/date'
import './StatementList.css'

const columns = [
    { accessorKey: 'controlNumber', header: 'Control #' },
    { accessorKey: 'servicesForName', header: 'Name' },
    {
        accessorKey: 'serviceDate',
        header: 'Service Date',
        cell: ({ getValue }) => formatDate(getValue())
    },
]

function StatementList() {
    const { data: statements, loading, error } = useFetchData(() => getStatements().then(r => r.data))
    const [search, setSearch] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [sorting, setSorting] = useState([{ id: 'controlNumber', desc: true }])

    const navigate = useNavigate()

    const filtered = useMemo(() => (statements ?? []).filter(s => {
        const matchesSearch = search === '' ||
            s.servicesForName.toLowerCase().includes(search.toLowerCase()) ||
            s.controlNumber.toString().includes(search)
        const matchesFrom = fromDate === '' || s.serviceDate >= fromDate
        const matchesTo = toDate === '' || s.serviceDate <= toDate
        return matchesSearch && matchesFrom && matchesTo
    }), [statements, search, fromDate, toDate])

    const tableInstance = useReactTable({
        columns,
        data: filtered,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    })

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="page statement-list">
            <h1>Statements</h1>
            <div className="statement-filters">
                <div className="form-field">
                    <label htmlFor="search">Search</label>
                    <input id="search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or control number" />
                </div>
                <div className="form-field">
                    <label htmlFor="fromDate">From</label>
                    <input id="fromDate" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="toDate">To</label>
                    <input id="toDate" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
            </div>
            {(statements ?? []).length === 0 ? (
                <div className="empty-state">
                    <p>No statements found. <Link to="/statements/new" className="btn btn-primary">Create a new statement</Link>.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No results</p>
                </div>
            ) : (
                <table className='statement-table'>
                    <thead>
                        {tableInstance.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === 'asc' ? <MdArrowUpward size={10} /> : header.column.getIsSorted() === 'desc' ? <MdArrowDownward size={10} /> : <MdSwapVert />}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {tableInstance.getRowModel().rows.map(row => (
                            <tr key={row.id} onClick={() => navigate(`/statements/${row.original.id}`)} style={{ cursor: 'pointer' }}>
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

export default StatementList;