document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarDays = document.getElementById('calendar-days');
    const selectedDateElement = document.getElementById('selectedDate');

    let currentDate = new Date();
    let selectedDate = new Date();
    
    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatDisplayDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    function renderTasks(date) {
        const dateStr = formatDate(date);
        taskList.innerHTML = '';
        const dateTasks = tasks[dateStr] || [];
        
        dateTasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.completed) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTask(dateStr, index));

            const taskText = document.createElement('span');
            taskText.textContent = task.text;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteTask(dateStr, index));

            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });

        selectedDateElement.textContent = `Tasks for ${formatDisplayDate(date)}`;
        taskDate.value = dateStr;
    }

    function addTask() {
        const text = taskInput.value.trim();
        const dateStr = taskDate.value || formatDate(selectedDate);
        
        if (text) {
            if (!tasks[dateStr]) {
                tasks[dateStr] = [];
            }
            tasks[dateStr].push({ text, completed: false });
            saveTasks();
            renderTasks(new Date(dateStr));
            renderCalendar();
            taskInput.value = '';
        }
    }

    function toggleTask(dateStr, index) {
        tasks[dateStr][index].completed = !tasks[dateStr][index].completed;
        saveTasks();
        renderTasks(new Date(dateStr));
    }

    function deleteTask(dateStr, index) {
        tasks[dateStr].splice(index, 1);
        if (tasks[dateStr].length === 0) {
            delete tasks[dateStr];
        }
        saveTasks();
        renderTasks(new Date(dateStr));
        renderCalendar();
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month display
        currentMonthElement.textContent = new Date(year, month, 1)
            .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Clear calendar
        calendarDays.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Add empty cells for days before start of month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day');
            calendarDays.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;

            const currentDateStr = formatDate(new Date(year, month, day));
            
            // Add indicators and classes
            if (tasks[currentDateStr] && tasks[currentDateStr].length > 0) {
                dayElement.classList.add('has-tasks');
            }
            
            if (day === selectedDate.getDate() && 
                month === selectedDate.getMonth() && 
                year === selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }

            const today = new Date();
            if (day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);
                renderCalendar();
                renderTasks(selectedDate);
            });

            calendarDays.appendChild(dayElement);
        }
    }

    // Event Listeners
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Initial render
    renderCalendar();
    renderTasks(selectedDate);
});