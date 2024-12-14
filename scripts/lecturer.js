document.addEventListener('DOMContentLoaded', () => {
    // Declare global variables for sections
    const lecturesSection = document.getElementById('lectures-section');
    const appealsSection = document.getElementById('appeals-section');

    const currentPage = document.body.dataset.page;
    const links = [
        {
            id: 'lectures-btn',
            text: 'Lectures',
            target: lecturesSection,
            hiddenSection: [appealsSection], // Sections to hide when lectures section is active
            isActive: true
        },
        {
            id: 'appeals-btn',
            text: 'Appeals',
            target: appealsSection,
            hiddenSection: [lecturesSection], // Sections to hide when appeals section is active
            isActive: false
        }
    ];

    // Create the navbar with lecturer style
    createNavbar(links, false);

    // Function to handle navbar section switching
    const handleNavbarClick = (activeLink) => {
        links.forEach(link => {
            // Show the active section
            if (link === activeLink) {
                link.target.style.display = 'block';
                // Hide the sections specified in hiddenSection for the active link
                link.hiddenSection.forEach(section => {
                    section.style.display = 'none';
                });
                // Reload lectures if the lectures section is clicked
                if (link.id === 'lectures-btn') {
                    displayLectureButtons(); // Ensure lecture buttons are displayed
                }
            } else {
                link.target.style.display = 'none'; // Hide the other sections
            }
        });
    };

    // Attach click events to the navbar buttons
    links.forEach(link => {
        const button = document.getElementById(link.id);
        if (button) {
            button.addEventListener('click', () => handleNavbarClick(link));
        }
    });

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Function to display lecture buttons
    const displayLectureButtons = () => {
        Promise.all([fetch('jsons/courses.json').then(response => response.json()), fetch('jsons/lectures.json').then(response => response.json())])
        .then(([courses, lectures]) => {
            const lecturerLectures = lectures.filter(lecture => lecture.lecturer_id === currentUser.id);
            
            if (lecturesSection) {
                lecturesSection.innerHTML = ''; // Clear existing content
                lecturesSection.style.display = 'flex';
                lecturesSection.style.flexWrap = 'wrap';
                lecturesSection.style.gap = '20px';

                lecturerLectures.forEach(lecture => {
                    const course = courses.find(course => course.id === lecture.course_id);
                    if (course) {
                        const button = document.createElement('div');
                        button.classList.add('p-6', 'bg-white', 'rounded-lg', 'shadow-md', 'cursor-pointer', 
                                             'transform', 'transition-transform', 'duration-300', 
                                             'hover:scale-105', 'hover:transform-origin-center', 
                                             'min-w-[350px]', 'min-h-[200px]', 'sm:w-4/5', 'md:w-3/4', 
                                             'lg:w-2/3', 'xl:w-1/2', 'mx-auto');
                        button.innerHTML = ` 
                            <h3 class="lg:text-xl md:text-md sm:text-xs font-bold">${course.id} / ${course.name} / ${lecture.type}</h3>
                            <h2 class="lg:text-base md:text-sm sm:text-xs">${lecture.day_of_week}: ${lecture.start_time} - ${lecture.end_time}</h2>
                        `;
                        button.addEventListener('click', () => cardClickHandler(lecture.course_id, lecture.type, lecture.lecturer_id));
                        lecturesSection.appendChild(button);
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching courses or lectures:', error));
    };

    if (currentPage === 'lecturer') {
        displayLectureButtons();
    }

    // Function to handle card click
    function cardClickHandler(courseId, type, lecturerId) {
        if (lecturesSection) {
            lecturesSection.innerHTML = ''; // Clear the section for the new content
        }

        fetch('jsons/records.json')
            .then(response => response.json())
            .then(data => {
                const filteredRecords = data.filter(record => 
                    record.course_id === courseId &&
                    record.type === type &&
                    record.lecturer_id === lecturerId
                );

                const uniqueDates = [...new Set(filteredRecords.map(record => record.date))];

                if (uniqueDates.length > 0) {
                    const selectMenuContainer = document.createElement('div');
                    selectMenuContainer.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'w-full', 'mt-4');

                    const selectDateLabel = document.createElement('label');
                    selectDateLabel.setAttribute('for', 'date-select');
                    selectDateLabel.classList.add('text-lg', 'font-semibold', 'mb-2');
                    selectDateLabel.innerText = 'Select Date:';
                    selectMenuContainer.appendChild(selectDateLabel);

                    const selectMenu = document.createElement('select');
                    selectMenu.id = 'date-select';
                    selectMenu.classList.add('p-4', 'bg-white', 'rounded-md', 'shadow-md', 'text-sm', 'w-auto');
                    selectMenu.innerHTML = `<option value="" disabled selected>Select Date</option>`;
                    
                    uniqueDates.forEach(date => {
                        const option = document.createElement('option');
                        option.value = date;
                        option.innerText = date;
                        selectMenu.appendChild(option);
                    });

                    selectMenu.value = uniqueDates[uniqueDates.length - 1]; // Set default selected value

                    selectMenu.addEventListener('change', () => {
                        const selectedDate = selectMenu.value;
                        displayRecordsForDate(filteredRecords, selectedDate);
                    });

                    selectMenuContainer.appendChild(selectMenu);
                    lecturesSection.appendChild(selectMenuContainer); // Append select menu container to lectures section

                    // Automatically display records for the default selected date
                    displayRecordsForDate(filteredRecords, selectMenu.value);
                } else {
                    console.log('No records found for this lecture.');
                }
            })
            .catch(error => {
                console.error('Error fetching records.json:', error);
            });
    }

    // Function to display records for selected date
    // Function to display records for selected date
    // Function to display records for selected date
    function displayRecordsForDate(records, date) {
        console.log('Selected Date:', date);

        const recordsForDate = records.filter(record => record.date === date);
        console.log('Filtered records for date:', recordsForDate);

        if (lecturesSection) {
            lecturesSection.classList.remove('hidden');

            // Find or create the container
            let container = lecturesSection.querySelector('.records-container');
            if (!container) {
                container = document.createElement('div');
                container.classList.add(
                    'records-container',
                    'w-full',
                    'overflow-x-auto',
                    'py-4',
                    'flex',
                    'justify-center',
                    'sm:px-4',
                    'md:px-6',
                    'lg:px-8'
                );
                lecturesSection.appendChild(container);
            }

            // Clear only the table inside the container
            container.innerHTML = '';

            // Make lecturesSection responsive
            lecturesSection.classList.add('w-full', 'px-4', 'sm:px-6', 'md:px-8', 'py-4');

            if (recordsForDate.length > 0) {
                // Create table
                const table = document.createElement('table');
                table.classList.add(
                    'bg-white',
                    'shadow-md',
                    'rounded-lg',
                    'overflow-hidden',
                    'border',
                    'border-gray-200',
                    'table-auto',
                    'w-full', // Ensures the table takes the full width on small screens
                    'sm:w-auto' // Allows the table to auto adjust width on larger screens
                );

                const tableHead = document.createElement('thead');
                tableHead.classList.add('bg-blue-500', 'text-white');
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `
                    <th class="px-6 py-3 text-left">Name</th>
                    <th class="px-6 py-3 text-left">ID</th>
                    <th class="px-6 py-3 text-left">Status</th>
                `;
                tableHead.appendChild(headerRow);
                table.appendChild(tableHead);

                const tableBody = document.createElement('tbody');

                fetch('jsons/users.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to load users.json');
                        }
                        return response.json();
                    })
                    .then(users => {
                        recordsForDate.forEach(record => {
                            record.records.forEach(attendance => {
                                const student = users.find(user => user.id === attendance.student_id);

                                if (student) {
                                    const row = document.createElement('tr');
                                    row.classList.add('hover:bg-gray-100');
                                    const statusCell = document.createElement('td');
                                    statusCell.classList.add('border', 'px-6', 'py-4', 'cursor-pointer');

                                    // Set the status cell text and color
                                    statusCell.innerText = attendance.status;
                                    if (attendance.status === 'missed') {
                                        statusCell.classList.add('text-red-600');
                                    } else {
                                        statusCell.classList.add('text-green-600');
                                    }

                                    // Add a click event to toggle the status
                                    statusCell.addEventListener('click', () => {
                                        // Toggle the status
                                        if (attendance.status === 'missed') {
                                            attendance.status = 'attended';
                                            statusCell.classList.remove('text-red-600');
                                            statusCell.classList.add('text-green-600');
                                        } else {
                                            attendance.status = 'missed';
                                            statusCell.classList.remove('text-green-600');
                                            statusCell.classList.add('text-red-600');
                                        }
                                        // Update the cell text content
                                        statusCell.innerText = attendance.status;

                                        // Optionally, update this change in the backend or local storage
                                        // You might want to save the updated records, for example, with localStorage
                                        console.log('Updated status:', attendance.status);
                                    });

                                    row.innerHTML = `
                                        <td class="border px-6 py-4">${student.first_name} ${student.last_name}</td>
                                        <td class="border px-6 py-4">${student.id}</td>
                                    `;
                                    row.appendChild(statusCell);
                                    tableBody.appendChild(row);
                                }
                            });

                            table.appendChild(tableBody);
                            container.appendChild(table); // Append table to the container
                        })

                        // Check if the clarification text already exists
                        let clarTextContainer = lecturesSection.querySelector('.clarification-text-container');
                        if (!clarTextContainer) {
                            // Add clarification text under the table only once
                            const clarificationText = document.createElement('p');
                            clarificationText.classList.add('text-center', 'text-gray-600', 'mt-4');
                            clarificationText.textContent = 'Click on a status to toggle between "Attended" and "Missed".';
                            clarTextContainer = document.createElement('div');
                            clarTextContainer.appendChild(clarificationText);
                            clarTextContainer.classList.add('flex','justify-center', 'clarification-text-container', 'w-full');
                            lecturesSection.appendChild(clarTextContainer);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching users.json:', error);
                        alert('Error fetching users.json: ' + error);
                    });
            } else {
                const noRecordsMessage = document.createElement('p');
                noRecordsMessage.classList.add('text-center', 'text-gray-500', 'mt-4');
                noRecordsMessage.textContent = 'No records found for this date.';
                lecturesSection.appendChild(noRecordsMessage);
            }
        } else {
            console.error('Lecture records section not found!');
        }
    }



});
