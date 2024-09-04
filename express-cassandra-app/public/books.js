
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    document.getElementById('book-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
    
        // Handle date formatting
        if (formData.get('date_of_publication')) {
            const formattedDate = new Date(formData.get('date_of_publication')).toISOString().split('T')[0];
            formData.set('date_of_publication', formattedDate);
        }
    
        console.log('Form data before sending:', Object.fromEntries(formData));
    
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                body: formData  // Send formData directly, don't stringify
                // Remove the 'Content-Type' header, let the browser set it with the boundary
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('Server response:', result);
                alert('Book added successfully!');
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(`Error adding book: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Error adding book: ' + error.message);
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
            if (book.name == "test"){
                console.log(book);
            }
            const listItem = document.createElement('tr');
            listItem.innerHTML = `
                <td>
                    ${book.cover_image_path && book.cover_image_path.trim() !== ''
                        ? `<img src="${book.cover_image_path}" alt="Cover of ${book.name}" style="width: 50px; height: auto;">`
                        : `<div style="width: 50px; height: 50px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; font-size: 12px; color: #666;">No Cover</div>`
                    }
                </td>
                <td>${book.name}</td>
                <td>${book.summary}</td>
                <td>${book.date_of_publication}</td>
                <td>${book.number_of_sales}</td>
                <td><button onclick="editBook('${book.id}')">Edit</button></td>
                <td><button onclick="deleteBook('${book.id}')">Delete</button></td>
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