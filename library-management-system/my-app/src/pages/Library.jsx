import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance";
// import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import AddBook from "../components/AddBook";

function Library() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET: Initial fetch + Retry
  async function fetchBooks() {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/books");
      setBooks(response.data);
    } catch (err) {
      console.error("GET error:", err);

      setError(
        err.response
          ? "Unable to load books. Server returned an error."
          : "Unable to connect to JSON Server. Please check whether it is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      try {
        setLoading(true);
        setError("");

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await axiosInstance.get("/books");

        if (isMounted) {
          setBooks(response.data);
        }
      } catch (err) {
        console.error("GET error:", err);

        if (isMounted) {
          setError(
            err.response
              ? "Unable to load books. Server returned an error."
              : "Unable to connect to JSON Server. Please check whether it is running.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debouncing: wait 500ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // POST: Add a new book
  async function handleAddBook(bookData) {
    try {
      const response = await axiosInstance.post("/books", {
        ...bookData,
        available: true,
      });

      setBooks((previousBooks) => [...previousBooks, response.data]);

      return true;
    } catch (err) {
      console.error("POST error:", err);

      alert(
        err.response
          ? "Unable to add the book. Please check the book details."
          : "Unable to connect to the server. Please try again.",
      );

      return false;
    }
  }

  // PUT: Update an existing book
  async function handleUpdateBook(bookId, updatedData) {
    try {
      const existingBook = books.find(
        (book) => String(book.id) === String(bookId),
      );

      if (!existingBook) {
        alert("Book not found.");
        return false;
      }

      const url = `/books/${bookId}`;

      const response = await axiosInstance.put(url, {
        ...existingBook,
        ...updatedData,
        id: existingBook.id,
      });

      setBooks((previousBooks) =>
        previousBooks.map((book) =>
          String(book.id) === String(bookId) ? response.data : book,
        ),
      );

      return true;
    } catch (err) {
      console.error("PUT error:", err);

      alert(
        err.response
          ? "Unable to update the book. Please try again."
          : "Server connection failed. Please try again.",
      );

      return false;
    }
  }

  // DELETE: Delete a book
  async function handleDelete(bookId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?",
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/books/${bookId}`);

      setBooks((previousBooks) =>
        previousBooks.filter((book) => String(book.id) !== String(bookId)),
      );
    } catch (err) {
      console.error("DELETE error:", err);

      alert(
        err.response
          ? "Unable to delete the book. Please try again."
          : "Server connection failed. Please try again.",
      );
    }
  }

  // Search by title or author
  const search = debouncedSearch.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const category = (book.category || "").toLowerCase();

    return (
      title.includes(search) ||
      author.includes(search) ||
      category.includes(search)
    );
  });

  return (
    <div id="home">
      {/* <Navbar /> */}

      <main className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-badge">YOUR DIGITAL LIBRARY</span>

            <h1>
              Discover Your Next
              <span> Favorite Book</span>
            </h1>

            <p>
              Explore books, discover new authors, and manage your personal
              library in one place.
            </p>

            <a href="#books" className="hero-btn">
              Explore Collection →
            </a>
          </div>

          <div className="hero-illustration">
            <span>📚</span>
          </div>
        </section>

        {/* Book Collection */}
        <section className="library-section" id="books">
          <div className="section-heading">
            <div>
              <p className="data">YOUR COLLECTION</p>

              <h2>Explore Our Books</h2>

              <p className="total-books">
                {books.length} books in your library
              </p>
            </div>

            <input
              type="search"
              className="search-input"
              placeholder="🔍 Search books or authors..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="message-box text-center" role="status">
              <div
                className="spinner-border text-primary"
                role="status"
                aria-label="Loading books"
              >
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="mt-3">📚 Loading your books...</p>
            </div>
          )}

          {/* Error + Retry */}
          {!loading && error && (
            <div className="message-box error-box" role="alert">
              <p>{error}</p>

              <button
                type="button"
                className="retry-btn"
                onClick={fetchBooks}
                disabled={loading}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Display Books */}
          {!loading && !error && (
            <>
              {filteredBooks.length > 0 ? (
                <div className="book-grid">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onDelete={handleDelete}
                      onUpdate={handleUpdateBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="message-box">
                  <span className="empty-icon">🔎</span>

                  <h3>No books found</h3>

                  <p>Try another search or add a new book.</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Add Book Form */}
        <AddBook onAddBook={handleAddBook} />

        {/* Footer */}
        <footer className="footer">
          <p>© 2026 BookShelf Library Management System</p>
        </footer>
      </main>
    </div>
  );
}

export default Library;
