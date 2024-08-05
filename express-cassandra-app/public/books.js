document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    document.getElementById('book-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        if (data.date_of_publication) {
            data.date_of_publication = new Date(data.date_of_publication).toISOString().split('T')[0];
        }

        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Book added successfully!');
            window.location.reload();
        } else {
            alert('Error adding book');
        }
    });

    document.getElementById('edit-book-form-content').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        if (data.date_of_publication) {
            data.date_of_publication = new Date(data.date_of_publication).toISOString().split('T')[0];
        }

        const response = await fetch(`/api/books/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Book updated successfully!');
            window.location.reload();
        } else {
            alert('Error updating book');
        }
    });
});

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = '';
        books.forEach(book => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${book.name}: ${book.summary} <br>(${book.date_of_publication}) - Sales: ${book.number_of_sales}
                <button onclick="editBook('${book.id}')">Edit</button>
                <button onclick="deleteBook('${book.id}')">Delete</button>
            `;
            booksList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function showAddBookForm() {
    document.getElementById('add-book-form').style.display = 'block';
}

function showEditBookForm(book) {
    document.getElementById('edit-book-form').style.display = 'block';
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-name').value = book.name;
    document.getElementById('edit-summary').value = book.summary;
    document.getElementById('edit-date_of_publication').value = book.date_of_publication;
    document.getElementById('edit-number_of_sales').value = book.number_of_sales;
}

async function editBook(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`);
        const book = await response.json();
        showEditBookForm(book);
    } catch (error) {
        console.error('Error fetching book for edit:', error);
    }
}

async function deleteBook(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Book deleted successfully!');
            window.location.reload();
        } else {
            const error = await response.json();
            alert('Error deleting book: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
    }
}