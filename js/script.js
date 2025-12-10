// Persisted data keys
const BOOKS_KEY = 'lm_books_v1';
const MEMBERS_KEY = 'lm_members_v1';

// initial demo data 
const initialBooks = [
  { id:1, title:'Introduction to Algorithms', author:'CLRS', category:'Computer Science', status:'Available' },
  { id:2, title:'Database Systems', author:'Elmasri', category:'IT', status:'Available' },
  { id:3, title:'Clean Code', author:'Robert Martin', category:'Software Engineering', status:'Available' },
  { id:4, title:'Digital Marketing 101', author:'Ali Hassan', category:'Business', status:'Available' }
];
const initialMembers = [
  { id:1, name:'Siti Salwah', email:'sitisalwah@gmail.com', borrowed:0 },
  { id:2, name:'Harry Kane', email:'harry05@gmail.com', borrowed:0 },
  { id:3, name:'Siti Nur', email:'sitinur@gmail.com', borrowed:2 }
];

// Utilities: load / save
function loadData(key, fallback){
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
}
function saveData(key, data){ localStorage.setItem(key, JSON.stringify(data)); }

let books = loadData(BOOKS_KEY, initialBooks);
let members = loadData(MEMBERS_KEY, initialMembers);

// DOM refs
const sections = {
  dashboard: document.getElementById('section-dashboard'),
  books: document.getElementById('section-books'),
  members: document.getElementById('section-members')
};

//  Navigation & UI 
document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const name = a.dataset.section;
    showSection(name);
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    a.classList.add('active');
  });
});
function showSection(name){ Object.keys(sections).forEach(s=> sections[s].style.display = (s===name ? '' : 'none')); }

// Logout
document.getElementById('logout').onclick = () => {
  localStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
};

// Render 
function loadStats(){
  document.getElementById('stat-books').textContent = books.length;
  document.getElementById('stat-members').textContent = members.length;
  document.getElementById('stat-borrowed').textContent = books.filter(b=>b.status==='Borrowed').length;
}

function animateValue(id, end) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const duration = 700;
  if (end <= 0) { el.textContent = '0'; return; }
  const stepTime = Math.max(Math.floor(duration / end), 20);
  let current = 0;
  const timer = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= end) clearInterval(timer);
  }, stepTime);
}

function animateStats(){
  animateValue('stat-books', books.length);
  animateValue('stat-members', members.length);
  animateValue('stat-borrowed', books.filter(b=>b.status==='Borrowed').length);
}

function renderCategoryTable(){
  const map = {};
  books.forEach(b=> map[b.category] = (map[b.category]||0)+1);
  const tbody = document.querySelector('#category-table tbody'); tbody.innerHTML='';
  Object.keys(map).forEach(cat => 
    tbody.insertAdjacentHTML('beforeend', `<tr><td>${escapeHtml(cat)}</td><td>${map[cat]}</td></tr>`)
  );
}

function renderBooks(filter=''){
  const tbody = document.querySelector('#books-table tbody'); tbody.innerHTML='';
  const q = filter.trim().toLowerCase();
  books.filter(b=> !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) )
    .forEach(b => {
      const actions = `
        <button class="btn btn-sm btn-outline-primary borrow-btn" data-id="${b.id}">${b.status==='Available' ? 'Borrow' : 'Return'}</button>
        <button class="btn btn-sm btn-secondary ms-1 edit-book" data-id="${b.id}">Edit</button>
        <button class="btn btn-sm btn-danger ms-1 delete-book" data-id="${b.id}">Delete</button>
      `;
      tbody.insertAdjacentHTML('beforeend', `<tr>
        <td>${b.id}</td>
        <td>${escapeHtml(b.title)}</td>
        <td>${escapeHtml(b.author)}</td>
        <td>${escapeHtml(b.category)}</td>
        <td><span class="badge ${b.status === 'Available' ? 'bg-success' : 'bg-danger'}">${b.status}</span></td>
        <td>${actions}</td>
        </tr>`);
    });
}

function renderMembers(filter=''){
  const tbody = document.querySelector('#members-table tbody'); tbody.innerHTML='';
  const q = filter.trim().toLowerCase();
  members.filter(m=> !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) )
    .forEach(m => {
      const actions = `
        <button class="btn btn-sm btn-secondary edit-member" data-id="${m.id}">Edit</button>
        <button class="btn btn-sm btn-danger ms-1 delete-member" data-id="${m.id}">Delete</button>
      `;
      tbody.insertAdjacentHTML('beforeend', `<tr><td>${m.id}</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.email)}</td><td>${m.borrowed}</td><td>${actions}</td></tr>`);
    });
}

// Simple HTML escaper
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

//  Search handlers
document.getElementById('book-search').addEventListener('input', e=> renderBooks(e.target.value));
document.getElementById('member-search').addEventListener('input', e=> renderMembers(e.target.value));

//  Add / Edit Book 
document.getElementById('add-book').addEventListener('click', ()=> openBookModal());
function openBookModal(book){
  const modal = new bootstrap.Modal(document.getElementById('bookModal'));
  document.getElementById('book-form').reset();
  document.getElementById('book-id').value = book ? book.id : '';
  document.getElementById('book-title').value = book ? book.title : '';
  document.getElementById('book-author').value = book ? book.author : '';
  document.getElementById('book-category').value = book ? book.category : '';
  document.getElementById('bookModalLabel').textContent = book ? 'Edit Book' : 'Add Book';
  modal.show();
}

document.getElementById('book-form').addEventListener('submit', e=>{
  e.preventDefault();
  const id = document.getElementById('book-id').value;
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const category = document.getElementById('book-category').value.trim();
  if (!title || !author || !category) return;
  if (id){
    // edit
    const b = books.find(x=> x.id==id);
    if (b){ b.title = title; b.author = author; b.category = category; }
  } else {
    // add
    const nid = books.length ? Math.max(...books.map(x=>x.id))+1 : 1;
    books.push({ id:nid, title, author, category, status:'Available' });
  }
  saveData(BOOKS_KEY, books);
  loadStats(); renderBooks(); renderCategoryTable();
  bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
});

//  Add / Edit Member
document.getElementById('add-member').addEventListener('click', ()=> openMemberModal());
function openMemberModal(member){
  const modal = new bootstrap.Modal(document.getElementById('memberModal'));
  document.getElementById('member-form').reset();
  document.getElementById('member-id').value = member ? member.id : '';
  document.getElementById('member-name').value = member ? member.name : '';
  document.getElementById('member-email').value = member ? member.email : '';
  document.getElementById('memberModalLabel').textContent = member ? 'Edit Member' : 'Add Member';
  modal.show();
}

document.getElementById('member-form').addEventListener('submit', e=>{
  e.preventDefault();
  const id = document.getElementById('member-id').value;
  const name = document.getElementById('member-name').value.trim();
  const email = document.getElementById('member-email').value.trim();
  if (!name || !email) return;
  if (id){
    const m = members.find(x=> x.id==id);
    if (m){ m.name = name; m.email = email; }
  } else {
    const nid = members.length ? Math.max(...members.map(x=>x.id))+1 : 1;
    members.push({ id:nid, name, email, borrowed:0 });
  }
  saveData(MEMBERS_KEY, members);
  loadStats(); renderMembers();
  bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
});

//  Delete handlers  
let pendingDelete = null; // {type:'book'|'member', id}

document.getElementById('confirm-yes').addEventListener('click', ()=>{
  if (!pendingDelete) return;
  if (pendingDelete.type==='book'){
    books = books.filter(b=> b.id !== pendingDelete.id);
    // if book was borrowed, decrement member count 
    members.forEach(m => { /* nothing to do unless tracking borrower id */ });
    saveData(BOOKS_KEY, books);
    renderBooks(); renderCategoryTable(); loadStats();
  } else if (pendingDelete.type==='member'){
    const member = members.find(m=> m.id===pendingDelete.id);
    if (member && member.borrowed > 0){
      alert('Cannot delete: member currently has borrowed books.');
    } else {
      members = members.filter(m=> m.id !== pendingDelete.id);
      saveData(MEMBERS_KEY, members);
      renderMembers(); loadStats();
    }
  }
  pendingDelete = null;
  bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
});

// Delegate table actions
document.addEventListener('click', (e)=>{
  // Edit book
  if (e.target.matches('.edit-book')){
    const id = Number(e.target.dataset.id);
    const b = books.find(x=> x.id===id);
    openBookModal(b);
  }
  // Delete book
  if (e.target.matches('.delete-book')){
    const id = Number(e.target.dataset.id);
    pendingDelete = { type:'book', id };
    document.getElementById('confirm-text').textContent = 'Delete this book?';
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }
  // Edit member
  if (e.target.matches('.edit-member')){
    const id = Number(e.target.dataset.id);
    const m = members.find(x=> x.id===id);
    openMemberModal(m);
  }
  // Delete member
  if (e.target.matches('.delete-member')){
    const id = Number(e.target.dataset.id);
    pendingDelete = { type:'member', id };
    document.getElementById('confirm-text').textContent = 'Delete this member?';
    new bootstrap.Modal(document.getElementById('confirmModal')).show();
  }
  // Borrow / Return
  if (e.target.matches('.borrow-btn')){
    const id = Number(e.target.dataset.id);
    const book = books.find(b=> b.id===id);
    if (!book) return;
    if (book.status === 'Available'){
      // open borrow modal
      document.getElementById('borrow-book-id').value = id;
      const sel = document.getElementById('borrow-member'); sel.innerHTML='';
      members.forEach(m=> sel.insertAdjacentHTML('beforeend', `<option value="${m.id}">${escapeHtml(m.name)} (${escapeHtml(m.email)})</option>`));
      new bootstrap.Modal(document.getElementById('borrowModal')).show();
    } else {
      // Return: set available and decrement first member found who has borrowed >0 
      book.status = 'Available';
      // try to decrement a member who has borrowed
      const borrower = members.find(m=> m.borrowed>0);
      if (borrower) borrower.borrowed = Math.max(0, borrower.borrowed-1);
      saveData(BOOKS_KEY, books); saveData(MEMBERS_KEY, members);
      renderBooks(); renderMembers(); loadStats(); renderCategoryTable();
    }
  }
});

// Handle borrow confirm
document.getElementById('borrow-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const bookId = Number(document.getElementById('borrow-book-id').value);
  const memberId = Number(document.getElementById('borrow-member').value);
  const book = books.find(b=> b.id===bookId);
  const member = members.find(m=> m.id===memberId);
  if (book && member && book.status==='Available'){
    book.status = 'Borrowed';
    member.borrowed = (member.borrowed||0) + 1;
    saveData(BOOKS_KEY, books); saveData(MEMBERS_KEY, members);
    renderBooks(); renderMembers(); loadStats(); renderCategoryTable();
    bootstrap.Modal.getInstance(document.getElementById('borrowModal')).hide();
  }
});

// Utility: escapeHtml already defined above function; redefine here for file-scope
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// dark mode toggle
const toggleBtn = document.getElementById('dark-toggle');

// Load saved mode
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// Toggle button handler
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        toggleBtn.textContent = "Light Mode";
    } else {
        localStorage.setItem('darkMode', 'disabled');
        toggleBtn.textContent = "Dark Mode";
    }
});


// Initialize UI
loadStats(); renderBooks(); renderMembers(); renderCategoryTable();












