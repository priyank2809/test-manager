import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { PlusIcon, SearchIcon } from "../../components/ui/Icons";
import Select from "../../components/ui/Select";
import { useTestsStore } from "../../store/testsStore";

const PAGE_SIZE = 5;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tests, isLoading, error, lastFetchedAt, fetchTests } =
    useTestsStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch = t.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" || (t.status ?? "draft") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tests, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTests.length / PAGE_SIZE));
  const paginatedTests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTests.slice(start, start + PAGE_SIZE);
  }, [filteredTests, page]);

  const isInitialLoading = isLoading && tests.length === 0;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Tests</h1>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
            {tests.length} test{tests.length === 1 ? "" : "s"} total
            {lastFetchedAt && (
              <span className="text-text-placeholder">
                · loaded {new Date(lastFetchedAt).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchTests({ force: true })}
              disabled={isLoading}
              className="text-brand hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isLoading && tests.length > 0 ? "Refreshing..." : "Refresh"}
            </button>
          </p>
        </div>
        <button
          onClick={() => navigate("/tests/new")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2.5 transition-colors shadow-sm"
        >
          <PlusIcon />
          Create New Test
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-72">
          <SearchIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tests by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-light pl-9 pr-3.5 py-2 text-sm placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="unpublished">Unpublished</option>
            <option value="expired">Expired</option>
          </Select>
        </div>
      </div>

      <div className="border border-border-light rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-semi-white text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Questions</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isInitialLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-t border-border-light">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-3.5 rounded bg-brand-semi-white animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isInitialLoading && error && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-danger"
                >
                  {error}
                </td>
              </tr>
            )}

            {!isInitialLoading && !error && filteredTests.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-text-secondary"
                >
                  No tests found.
                </td>
              </tr>
            )}

            {!isInitialLoading &&
              !error &&
              paginatedTests.map((test) => (
                <tr
                  key={test.id}
                  className="border-t border-border-light hover:bg-brand-semi-white/40"
                >
                  <td className="px-5 py-3 font-medium text-text-primary">
                    {test.name}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {test.subject}
                  </td>
                  <td className="px-5 py-3 text-text-secondary capitalize">
                    {test.type}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {test.questions?.length ?? 0} / {test.total_questions}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {new Date(test.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/tests/${test.id}/edit`)}
                        className="text-brand text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/tests/${test.id}/view`)}
                        className="text-text-secondary text-sm font-medium hover:underline"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!isInitialLoading && !error && filteredTests.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-light text-sm text-text-secondary">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredTests.length)} of{" "}
              {filteredTests.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                title="First page"
                className="px-3 py-1.5 rounded-md border border-border-light disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-semi-white"
              >
                « First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-border-light disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-semi-white"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-border-light disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-semi-white"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                title="Last page"
                className="px-3 py-1.5 rounded-md border border-border-light disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-semi-white"
              >
                Last »
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}