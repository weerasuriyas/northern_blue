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

test('shows a loading spinner when loading=true', () => {
  const { container } = render(<DataTable columns={COLS} data={[]} loading />)
  expect(container.querySelector('.animate-spin')).toBeInTheDocument()
})

test('does not render the table while loading', () => {
  render(<DataTable columns={COLS} data={ROWS} loading />)
  expect(screen.queryByRole('table')).toBeNull()
})

test('shows the empty message when data is empty', () => {
  render(<DataTable columns={COLS} data={[]} />)
  expect(screen.getByText('No data.')).toBeInTheDocument()
})

test('shows a custom empty message', () => {
  render(<DataTable columns={COLS} data={[]} emptyMessage="Nothing here yet." />)
  expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
})

test('renders column headers', () => {
  render(<DataTable columns={COLS} data={ROWS} />)
  expect(screen.getByText('Name')).toBeInTheDocument()
  expect(screen.getByText('Status')).toBeInTheDocument()
})

test('renders all data rows', () => {
  render(<DataTable columns={COLS} data={ROWS} />)
  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
  expect(screen.getByText('active')).toBeInTheDocument()
})

test('uses a custom render function when provided', () => {
  const cols = [
    { key: 'name', header: 'Name', render: (row) => <strong>{row.name.toUpperCase()}</strong> },
  ]
  render(<DataTable columns={cols} data={[{ id: '1', name: 'Alice' }]} />)
  expect(screen.getByText('ALICE')).toBeInTheDocument()
})

test('falls back to row index as key when row has no id', () => {
  const rows = [{ name: 'No ID Row', status: 'ok' }]
  // should render without crashing
  render(<DataTable columns={COLS} data={rows} />)
  expect(screen.getByText('No ID Row')).toBeInTheDocument()
})
