import React, { useState } from 'react';
import { 
  Search, Filter, Download, ChevronDown, 
  ChevronUp, Eye, MoreVertical 
} from 'lucide-react';

const OrderTable = ({
  orders = [],
  onViewOrder,
  onDownloadInvoice,
  title = "Recent Orders",
  showSearch = true,
  showFilters = true,
  pageSize = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActions, setShowActions] = useState(null);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6b7280',
      confirmed: '#3b82f6',
      'in-progress': '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444',
      returned: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="order-table">
      <div className="table-header">
        <h3 className="table-title">{title}</h3>

        <div className="table-controls">
          {showSearch && (
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {showFilters && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('orderNumber')} className="sortable">
                Order #
                <SortIcon field="orderNumber" />
              </th>
              <th onClick={() => handleSort('customer')} className="sortable">
                Customer
                <SortIcon field="customer" />
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date
                <SortIcon field="date" />
              </th>
              <th onClick={() => handleSort('total')} className="sortable">
                Total
                <SortIcon field="total" />
              </th>
              <th>Status</th>
              <th>Payment</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-content">
                    <span className="empty-icon">📋</span>
                    <p>No orders found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} className="table-row">
                  <td className="order-number">#{order.orderNumber}</td>
                  <td className="customer-name">{order.customer || 'N/A'}</td>
                  <td className="order-date">{formatDate(order.date)}</td>
                  <td className="order-total">{formatCurrency(order.total)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ '--status-color': getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button
                        className="action-btn view"
                        onClick={() => onViewOrder(order)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      {order.paymentStatus === 'paid' && (
                        <button
                          className="action-btn download"
                          onClick={() => onDownloadInvoice(order)}
                          title="Download invoice"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .order-table {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          animation: fadeIn 0.5s ease;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .table-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          min-width: 250px;
        }

        .search-box svg {
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .search-box input {
          border: none;
          background: transparent;
          color: white;
          font-size: 0.9rem;
          width: 100%;
        }

        .search-box input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-box input:focus {
          outline: none;
        }

        .status-filter {
          padding: 0.625rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .status-filter option {
          background: #1e293b;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 0.5rem;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: rgba(255, 255, 255, 0.05);
        }

        th {
          padding: 1rem;
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th.sortable {
          cursor: pointer;
          user-select: none;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        th.sortable:hover {
          color: #3b82f6;
        }

        .table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s ease;
        }

        .table-row:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        td {
          padding: 1rem;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
        }

        .order-number {
          font-weight: 600;
          color: #3b82f6;
        }

        .customer-name {
          font-weight: 500;
        }

        .order-date {
          color: rgba(255, 255, 255, 0.6);
        }

        .order-total {
          font-weight: 700;
          color: white;
        }

        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          background: color-mix(in srgb, var(--status-color) 20%, transparent);
          border: 1px solid color-mix(in srgb, var(--status-color) 40%, transparent);
          color: var(--status-color);
        }

        .payment-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .payment-badge.paid {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .payment-badge.pending {
          background: rgba(251, 191, 36, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .payment-badge.partial {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .actions-cell {
          width: 100px;
        }

        .actions-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .empty-state {
          padding: 3rem 2rem;
          text-align: center;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-icon {
          font-size: 3rem;
        }

        .empty-content p {
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .table-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .page-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .page-number {
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-number:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
        }

        .page-number.active {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
          color: #3b82f6;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }

          .table-controls {
            flex-direction: column;
          }

          .search-box {
            min-width: auto;
          }

          .table-container {
            overflow-x: scroll;
          }

          .table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderTable;
