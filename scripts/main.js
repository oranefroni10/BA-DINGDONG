document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.dataset.page;

    // Common utilities
    const handleDarkModeToggle = () => {
        document.body.classList.toggle('dark');
    
        // Update background color of boxes
        const squares = document.querySelectorAll('.statistics-square');
        const isDarkMode = document.body.classList.contains('dark');
    
        squares.forEach(square => {
            square.style.backgroundColor = isDarkMode ? '#2d3748' : 'white';
            square.style.color = isDarkMode ? '#e2e8f0' : 'black'; // Ensure text is visible
        });
    };
    
    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    const toggleSections = (activeSection, hiddenSection) => {
        if (activeSection && hiddenSection) {
            activeSection.classList.remove('hidden');
            hiddenSection.classList.add('hidden');
        }
    };

    const createNavbar = (links, isStudent) => {
        const navbar = document.createElement('nav');
        navbar.classList.add(isStudent ? 'bg-green-500' : 'bg-blue-500', 'text-white', 'p-4', 'flex', 'justify-between', 'items-center', 'relative');
    
        const navContent = `
            <div class="text-2xl font-bold">BA-DINGDONG</div>
            <!-- Burger button for small screens -->
            <div class="lg:hidden">
                <button id="burger-btn" class="text-white text-2xl">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            
            <!-- Navbar Links (Visible on larger screens) -->
            <ul id="navbar-links" class="hidden lg:flex space-x-8">
                ${links.map(link => `<li><a href="javascript:void(0);" id="${link.id}" class="hover:text-gray-200 ${link.isActive ? 'active-link' : ''}">${link.text}</a></li>`).join('')}
            </ul>
    
            <!-- Navbar action buttons (Visible on both small and large screens) -->
            <div id="navbar-actions" class="flex space-x-4">
                <button id="dark-mode-toggle" class="bg-black-100 text-white-500 px-3 py-2 rounded-lg">
                    <i class="fas fa-moon"></i>
                </button>
                <button id="logout-btn" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition">Logout</button>
            </div>
        `;
        navbar.innerHTML = navContent;
        document.body.prepend(navbar);
    
        // Attach event listeners for links and buttons
        document.getElementById('dark-mode-toggle').addEventListener('click', handleDarkModeToggle);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
        links.forEach(link => {
            document.getElementById(link.id)?.addEventListener('click', () => {
                toggleSections(link.target, link.hiddenSection);
                // Mark the clicked link as active
                links.forEach(l => document.getElementById(l.id)?.classList.remove('active-link'));
                document.getElementById(link.id)?.classList.add('active-link');
            });
        });
    
        // Burger menu toggle (for small screens)
        document.getElementById('burger-btn').addEventListener('click', () => {
            const navbarLinks = document.getElementById('navbar-links');
            const navbarActions = document.getElementById('navbar-actions');
            navbarLinks.classList.toggle('hidden'); // Toggle visibility of links
            navbarActions.classList.toggle('hidden'); // Toggle visibility of dark mode and logout buttons
        });
    };
    

    // Expose functions globally for student.js and lecturer.js
    window.createNavbar = createNavbar;

    // Login Page Logic
    if (currentPage === 'login') {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        loginBtn?.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            fetch('jsons/users.json')
                .then(response => response.json())
                .then(users => {
                    const user = users.find(u => u.username === username && u.password === password);
                    if (user) {
                        // Save username, password, and id in localStorage
                        localStorage.setItem('currentUser', JSON.stringify({
                            username: user.username,
                            password: user.password,
                            id: user.id
                        }));
                        
                        if (user.type === 'Lecturer') {
                            window.location.href = 'lecturer.html';
                        } else if (user.type === 'Student') {
                            window.location.href = 'student.html';
                        }
                    } else {
                        alert('Invalid username or password');
                    }
                })
                .catch(error => console.error('Error loading users:', error));
        });
    }
});
