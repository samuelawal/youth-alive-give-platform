"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search,
  Eye,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import apiClient from '@/lib/api-client';
import toast from "react-hot-toast";
import TransactionDetails from "./transaction-details";

// API Base URL
// API_BASE_URL removed - using apiClient instead

// API Response types
interface APITransactionResponse {
  id: string;
  status: string;
  transactionStatus?: string;
  collectionId: string;
  type: string;
  response: Record<string, unknown>;
  time: string;
}

interface APICollectionResponse {
  id: string;
  paymentGateway: string;
  currency: string;
  amount: number;
  collectionTypeId: string;
  collectionType: {
    id: string;
    name: string;
    status: boolean;
    time: string;
  };
  transactions: APITransactionResponse[];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  comment: string;
  collectionNo: string;
  collectionReference: string;
  collectionStatus: string;
  customerNumber?: string;
  customerBankCode?: string;
  countryCode?: string;
  time: string;
}

interface TransactionHistoryProps {
  onBack: () => void;
}

export default function TransactionHistory({ onBack }: TransactionHistoryProps) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionNo, setCollectionNo] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Define columns
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "collection.collectionNo",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-left justify-start"
          >
            Collection No
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <div className="font-mono text-sm">{getValue() as string}</div>
        ),
      },
      {
        id: "donor",
        accessorFn: (row) => row.collection,
        header: "Donor",
        cell: ({ getValue }) => {
          const collection = getValue() as Transaction["collection"];
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {collection?.firstName} {collection?.lastName}
              </div>
              <div className="text-xs text-gray-500">{collection?.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "collection.amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-right justify-end"
          >
            Amount
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue, row }) => {
          const amount = getValue() as number;
          const currency = row.original.collection?.currency;
          return (
            <div className="text-right font-medium">
              {currency} {amount?.toLocaleString()}
            </div>
          );
        },
      },
      {
        accessorKey: "collection.collectionType.name",
        header: "Offering Type",
        cell: ({ getValue }) => (
          <div className="text-sm">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "collection.collectionStatus",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusClass = {
            Successful: "bg-green-100 text-green-800 border-green-200",
            Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            Failed: "bg-red-100 text-red-800 border-red-200",
          }[status] || "bg-gray-100 text-gray-800 border-gray-200";
          
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-left justify-start"
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="text-sm">
              <div>{date.toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTransaction(row.original)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  // Fetch transactions for a specific collection
  const fetchTransactions = async (collectionNumber: string) => {
    if (!collectionNumber.trim()) {
      toast.error("Please enter a collection number");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<APICollectionResponse>(`collections/${collectionNumber.trim()}`);
      const collectionData = response.data;
      
      // Transform the response to match our Transaction interface
      // The response contains a collection with nested transactions
      const transactions: Transaction[] = collectionData.transactions.map((tx: APITransactionResponse) => ({
        id: tx.id,
        status: tx.status,
        transactionStatus: tx.transactionStatus || tx.status,
        collectionId: tx.collectionId,
        collection: {
          id: collectionData.id,
          paymentGateway: collectionData.paymentGateway as "PAYAZA",
          currency: collectionData.currency as "NGN" | "USD",
          amount: collectionData.amount,
          collectionTypeId: collectionData.collectionTypeId,
          collectionType: collectionData.collectionType,
          transactions: collectionData.transactions.map((t: APITransactionResponse) => t.id),
          firstName: collectionData.firstName,
          lastName: collectionData.lastName,
          email: collectionData.email,
          phoneNumber: collectionData.phoneNumber,
          comment: collectionData.comment,
          collectionNo: collectionData.collectionNo,
          collectionReference: collectionData.collectionReference,
          collectionStatus: collectionData.collectionStatus as "Pending" | "Successful" | "Failed",
          customerNumber: collectionData.customerNumber || "",
          customerBankCode: collectionData.customerBankCode || "",
          countryCode: collectionData.countryCode || "",
          time: collectionData.time,
        },
        type: tx.type as "CHARGE",
        response: tx.response,
        time: tx.time,
      }));
      
      setData(transactions);
      setTotalElements(transactions.length);
      setTotalPages(Math.ceil(transactions.length / pagination.pageSize));
      setHasSearched(true);
      toast.success(`Found ${transactions.length} transaction(s) for collection ${collectionNumber}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(errorMessage);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
      setHasSearched(true);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchTransactions(collectionNo);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setCollectionNo("");
    setData([]);
    setHasSearched(false);
    setError(null);
    setGlobalFilter("");
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Show transaction details modal
  if (selectedTransaction) {
    return (
      <TransactionDetails
        transaction={selectedTransaction}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 p-0 h-auto text-[#52024F] hover:text-[#52024F]/80"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Support
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
          <p className="text-gray-600 text-sm mt-1">
            View and search through all transaction records
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Search className="h-4 w-4" />
          Search Transactions by Collection Number
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="collectionNo" className="text-sm font-medium text-gray-700">
              Collection Number *
            </Label>
            <Input
              id="collectionNo"
              placeholder="Enter collection number (e.g., COLL123456)"
              value={collectionNo}
              onChange={(e) => setCollectionNo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1"
              disabled={loading}
            />
          </div>
          
          {/* {hasSearched && (
            <div>
              <Label htmlFor="globalSearch" className="text-sm font-medium text-gray-700">
                Filter Results
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="globalSearch"
                  placeholder="Filter transactions..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )} */}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSearch} 
            className="bg-[#52024F] hover:bg-[#52024F]/90"
            disabled={loading || !collectionNo.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Transactions
              </>
            )}
          </Button>
          {hasSearched && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear Search
            </Button>
          )}
        </div>
      </div>

      {/* Welcome Section - Show when no search has been performed */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Search Transaction History
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Enter a collection number above to view all transactions associated with that collection. 
            You can then filter the results further if needed.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> Collection numbers are typically in the format COLL123456 or similar.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && hasSearched && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-medium">Error loading transactions</h3>
              <p className="text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTransactions(collectionNo)}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {hasSearched && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading transactions...</span>
              </div>
            </div>
          )}
          
          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
              <p className="text-gray-500">
                {globalFilter
                  ? "Try adjusting your search filter"
                  : `No transactions found for collection number: ${collectionNo}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {hasSearched && data.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Pagination info */}
            <div className="text-sm text-gray-700">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalElements)} of{" "}
              {totalElements} results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-700 px-2">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="pageSize" className="text-sm text-gray-700">
                Show:
              </Label>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
