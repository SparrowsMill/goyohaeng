import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalCount, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} type="button" className={p === page ? "active" : ""} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      <span className="pagination-count">
        {rangeStart}-{rangeEnd} of {totalCount}
      </span>
    </div>
  );
}
