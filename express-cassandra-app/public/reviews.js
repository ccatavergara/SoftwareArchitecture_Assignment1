async function fetchReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function showAddReviewForm() {
    document.getElementById('add-review-form').style.display = 'block';
}

document.getElementById('review-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert('Review added successfully!');
        window.location.reload();
    } else {
        alert('Error adding review');
    }
});

async function displayReviews() {
    const reviews = await fetchReviews();
    const books = await fetchBooks();

    const bookMap = new Map();
    books.forEach(book => {
        bookMap.set(book.id, book.name);
    });

    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = '';

    reviews.forEach(review => {
        const bookName = bookMap.get(review.book);
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            Book: ${bookName} - Review: ${review.review} - Score: ${review.score} - Upvotes: ${review.number_of_upvotes}
        `;
        reviewsList.appendChild(listItem);
    });
}

async function populateBookDropdown() {
    const books = await fetchBooks();
    const bookSelect = document.getElementById('book');
    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.text = book.name;
        bookSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayReviews();
    populateBookDropdown();
});
