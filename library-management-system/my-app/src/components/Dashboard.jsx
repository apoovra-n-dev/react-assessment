import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Navbar from "./Navbar";

function Dashboard() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get("/books");
                setBooks(response.data);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const totalBooks = books.length;

    const availableBooks = books.filter(
        (book) =>
            String(book.status).toLowerCase() === "available" ||
            book.available === true
    ).length;

    const unavailableBooks = totalBooks - availableBooks;

    const totalCategories = new Set(
        books.map((book) => book.category).filter(Boolean)
    ).size;

    const stats = [
        {
            title: "Total Books",
            count: totalBooks,
            icon: "bi bi-book",
            color: "primary",
        },
        {
            title: "Available Books",
            count: availableBooks,
            icon: "bi bi-check-circle",
            color: "success",
        },
        {
            title: "Unavailable Books",
            count: unavailableBooks,
            icon: "bi bi-bookmark-x",
            color: "danger",
        },
        {
            title: "Categories",
            count: totalCategories,
            icon: "bi bi-grid",
            color: "warning",
        },
    ];

    return (
    <>
        <Navbar />

        <div className="container-fluid py-4 px-4">
            <h2 className="fw-bold mb-2">
                📚 Library Dashboard
            </h2>

            <p className="text-secondary mb-4">
                Welcome to your Library Management System.
            </p>

            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="mt-2">Loading dashboard...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            ) : (
                <div className="row g-4 mb-5">
                    {stats.map((stat) => (
                        <div
                            className="col-12 col-sm-6 col-xl-3"
                            key={stat.title}
                        >
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body d-flex align-items-center gap-3">
                                    <div
                                        className={`bg-${stat.color}-subtle text-${stat.color} rounded-3 p-3`}
                                    >
                                        <i className={`${stat.icon} fs-3`}></i>
                                    </div>

                                    <div>
                                        <p className="text-secondary mb-1">
                                            {stat.title}
                                        </p>

                                        <h3 className="fw-bold mb-0">
                                            {stat.count}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </>
);

}

export default Dashboard;