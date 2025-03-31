 
// client/src/components/IssueTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, TextField, IconButton,
  Chip, Box, Typography, CircularProgress
} from '@mui/material';
import { Search, Refresh, FilterList } from '@mui/icons-material';
import { Issue } from '../types/issue';
import { TableColumn, PaginationState } from '../types/ui';
import { getIssues, syncIssues } from '../services/api';
import { formatDate } from '../utils/dateUtils';

interface IssueTableProps {
    columns: TableColumn[];
    onSyncComplete?: () => void;
}

const IssueTable = ({ columns, onSyncComplete }: IssueTableProps): JSX.Element => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10
  });
  
  // Fetch issues on component mount and when search/filters/pagination change
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const result = await getIssues(
          searchQuery,
          pagination.currentPage + 1,
          pagination.pageSize,
          filters
        );
        
        setIssues(result.issues);
        setPagination(prev => ({
          ...prev,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / prev.pageSize)
        }));
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, [searchQuery, filters, pagination.currentPage, pagination.pageSize]);
  
  // Handle page change
  const handlePageChange = (_: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      currentPage: 0
    }));
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle search submit
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };
  
  // Handle sync button click
  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncIssues();
      
      // Refetch issues
      const result = await getIssues(
        searchQuery,
        pagination.currentPage + 1,
        pagination.pageSize,
        filters
      );
      
      setIssues(result.issues);
      setPagination(prev => ({
        ...prev,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / prev.pageSize)
      }));
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Error syncing issues:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  // Render cell content based on column configuration
  const renderCellContent = (row: Issue, column: TableColumn) => {
    const value = row[column.id];
    
    if (column.formatter) {
      return column.formatter(value, row);
    }
    
    // Default formatters for common data types
    if (column.id === 'key') {
      return <Link to={`/issues/${row.key}`}>{row.key}</Link>;
    }
    
    if (['created', 'updated'].includes(column.id)) {
      return formatDate(value);
    }
    
    if (column.id === 'status') {
      return (
        <Chip 
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      );
    }
    
    if (column.id === 'priority') {
      return (
        <Chip 
          label={value}
          color={getPriorityColor(value)}
          size="small"
        />
      );
    }
    
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <Chip 
          key={index} 
          label={item}
          size="small"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      ));
    }
    
    return value || '-';
  };
  
  // Helper function to get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'Open': 'primary',
      'In Progress': 'info',
      'Done': 'success',
      'Closed': 'secondary',
      'Resolved': 'success',
      'Reopened': 'warning',
      'To Do': 'default'
    };
    
    return statusMap[status] || 'default';
  };
  
  // Helper function to get priority color
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const priorityMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'Highest': 'error',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success',
      'Lowest': 'default'
    };
    
    return priorityMap[priority] || 'default';
  };
  
  // Get visible columns
  const visibleColumns = columns.filter(column => column.visible);
  
  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mr: 1, flex: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <IconButton type="submit">
            <Search />
          </IconButton>
        </Box>
        
        <IconButton onClick={handleSync} disabled={syncing}>
          {syncing ? <CircularProgress size={24} /> : <Refresh />}
        </IconButton>
        
        <IconButton>
          <FilterList />
        </IconButton>
      </Box>
      
      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="medium">
          <TableHead>
            <TableRow>
              {visibleColumns.map(column => (
                <TableCell 
                  key={column.id}
                  width={column.width}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No issues found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              issues.map(issue => (
                <TableRow 
                  key={issue.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {visibleColumns.map(column => (
                    <TableCell key={`${issue.id}-${column.id}`}>
                      {renderCellContent(issue, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={pagination.totalItems}
        rowsPerPage={pagination.pageSize}
        page={pagination.currentPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};

export default IssueTable;