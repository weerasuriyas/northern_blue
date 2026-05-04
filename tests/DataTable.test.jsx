import { render, screen } from '@testing-library/react'
import DataTable from '@/admin/components/DataTable'

const COLS = [
  { key: 'name',   header: 'Name' },
  { key: 'status', header: 'Status' },
]

const ROWS = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob',   status: 'inactive' },
]

test('loading state shows a spinner — not a blank screen or stale data', () => {
  const { container } = render(<DataTable columns={COLS} data={[]} loading />)
  expect(container.querySelector('.animate-spin')).toBeInTheDocument()
})

test('table is hidden while data is loading — no partial renders', () => {
  render(<DataTable columns={COLS} data={ROWS} loading />)
  expect(screen.queryByRole('table')).toBeNull()
})

test('empty state message shows when there is no data', () => {
  render(<DataTable columns={COLS} data={[]} />)
  expect(screen.getByText('No data.')).toBeInTheDocument()
})

test('custom empty message gives context-specific guidance', () => {
  render(<DataTable columns={COLS} data={[]} emptyMessage="No orders placed yet." />)
  expect(screen.getByText('No orders placed yet.')).toBeInTheDocument()
})

test('column headers are always visible for orientation', () => {
  render(<DataTable columns={COLS} data={ROWS} />)
  expect(screen.getByText('Name')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
})

test('all data rows are rendered — no silent truncation', () => {
  render(<DataTable columns={COLS} data={ROWS} />)
  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
  expect(screen.getByText('active')).toBeInTheDocument()
})

test('custom cell renderers apply correctly — e.g. status badges, links', () => {
  const cols = [
    { key: 'name', header: 'Name', render: (row) => <strong>{row.name.toUpperCase()}</strong> },
  ]
  render(<DataTable columns={cols} data={[{ id: '1', name: 'Alice' }]} />)
  expect(screen.getByText('ALICE')).toBeInTheDocument()
})

test('rows without an id do not crash the table', () => {
  render(<DataTable columns={COLS} data={[{ name: 'No ID Row', status: 'ok' }]} />)
  expect(screen.getByText('No ID Row')).toBeInTheDocument()
})
