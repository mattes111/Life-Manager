// Life Manager Pro - Comprehensive Life Management App
class LifeManager {
  constructor() {
    this.currentModule = "todo";
    this.data = this.loadData();
    this.init();
  }

  // Initialize the app
  init() {
    this.setupEventListeners();
    this.loadModule("todo");
    this.renderAllModules();
    this.setupModal();
  }

  // Setup all event listeners
  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const module = e.currentTarget.dataset.module;
        this.switchModule(module);
      });
    });

    // TO-DO Module
    this.setupTodoModule();

    // Finance Module
    this.setupFinanceModule();

    // Habits Module
    this.setupHabitsModule();

    // Goals Module
    this.setupGoalsModule();

    // Notes Module
    this.setupNotesModule();

    // Time Tracker Module
    this.setupTimeModule();

    // Mood Module
    this.setupMoodModule();

    // Health Module
    this.setupHealthModule();

    // Learning Module
    this.setupLearningModule();
  }

  // Switch between modules
  switchModule(moduleName) {
    // Update sidebar
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-module="${moduleName}"]`)
      .classList.add("active");

    // Update main content
    document.querySelectorAll(".module").forEach((module) => {
      module.classList.remove("active");
    });
    document.getElementById(`${moduleName}-module`).classList.add("active");

    this.currentModule = moduleName;
  }

  // Load module data
  loadModule(moduleName) {
    this.switchModule(moduleName);
  }

  // Data persistence
  loadData() {
    const defaultData = {
      todos: [],
      transactions: [],
      habits: [],
      goals: [],
      notes: [],
      timeSessions: [],
      moodEntries: [],
      healthData: [],
      skills: [],
    };

    const saved = localStorage.getItem("lifeManagerData");
    return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
  }

  saveData() {
    localStorage.setItem("lifeManagerData", JSON.stringify(this.data));
  }

  // TO-DO Module
  setupTodoModule() {
    const todoInput = document.getElementById("todo-input");
    const addTodoBtn = document.getElementById("add-todo");
    const todoList = document.getElementById("todo-list");
    const filterBtns = document.querySelectorAll(".filter-btn");

    // Add todo
    addTodoBtn.addEventListener("click", () => {
      const text = todoInput.value.trim();
      if (text) {
        this.addTodo(text);
        todoInput.value = "";
      }
    });

    // Enter key support
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTodoBtn.click();
      }
    });

    // Filter buttons
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.filterTodos(btn.dataset.filter);
      });
    });
  }

  addTodo(text) {
    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.data.todos.push(todo);
    this.saveData();
    this.renderTodos();
  }

  toggleTodo(id) {
    const todo = this.data.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveData();
      this.renderTodos();
    }
  }

  deleteTodo(id) {
    this.data.todos = this.data.todos.filter((t) => t.id !== id);
    this.saveData();
    this.renderTodos();
  }

  filterTodos(filter) {
    const todos = this.data.todos;
    let filteredTodos = todos;

    if (filter === "pending") {
      filteredTodos = todos.filter((t) => !t.completed);
    } else if (filter === "completed") {
      filteredTodos = todos.filter((t) => t.completed);
    }

    this.renderTodos(filteredTodos);
  }

  renderTodos(todos = this.data.todos) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = todo.completed ? "completed" : "";

      li.innerHTML = `
        <div class="todo-content">
          <input type="checkbox" ${
            todo.completed ? "checked" : ""
          } onchange="lifeManager.toggleTodo(${todo.id})">
          <span>${todo.text}</span>
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick="lifeManager.editTodo(${todo.id})">
            <i class="fas fa-edit"></i> Bearbeiten
          </button>
          <button class="delete-btn" onclick="lifeManager.deleteTodo(${
            todo.id
          })">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      todoList.appendChild(li);
    });
  }

  // Finance Module
  setupFinanceModule() {
    const addTransactionBtn = document.getElementById("add-transaction");

    addTransactionBtn.addEventListener("click", () => {
      const description = document.getElementById(
        "transaction-description"
      ).value;
      const amount = parseFloat(
        document.getElementById("transaction-amount").value
      );
      const type = document.getElementById("transaction-type").value;

      if (description && amount) {
        this.addTransaction(description, amount, type);
        document.getElementById("transaction-description").value = "";
        document.getElementById("transaction-amount").value = "";
      }
    });
  }

  addTransaction(description, amount, type) {
    const transaction = {
      id: Date.now(),
      description,
      amount: type === "expense" ? -amount : amount,
      type,
      date: new Date().toISOString(),
    };

    this.data.transactions.push(transaction);
    this.saveData();
    this.renderFinance();
  }

  renderFinance() {
    // Calculate totals
    const balance = this.data.transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const monthlyIncome = this.data.transactions
      .filter((t) => t.type === "income" && this.isThisMonth(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = this.data.transactions
      .filter((t) => t.type === "expense" && this.isThisMonth(t.date))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Update display
    document.getElementById("balance").textContent = `€${balance.toFixed(2)}`;
    document.getElementById(
      "monthly-income"
    ).textContent = `€${monthlyIncome.toFixed(2)}`;
    document.getElementById(
      "monthly-expenses"
    ).textContent = `€${monthlyExpenses.toFixed(2)}`;

    // Render transactions
    const transactionsList = document.getElementById("transactions-list");
    transactionsList.innerHTML = "";

    this.data.transactions
      .slice(-10)
      .reverse()
      .forEach((transaction) => {
        const li = document.createElement("li");
        li.className = "transaction-item";
        li.innerHTML = `
        <div>
          <strong>${transaction.description}</strong>
          <div class="transaction-date">${new Date(
            transaction.date
          ).toLocaleDateString()}</div>
        </div>
        <div class="item-actions">
          <span class="${transaction.amount > 0 ? "income" : "expense"}">
            ${transaction.amount > 0 ? "+" : ""}€${transaction.amount.toFixed(
          2
        )}
          </span>
          <button class="edit-btn" onclick="lifeManager.editTransaction(${
            transaction.id
          })">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" onclick="lifeManager.deleteTransaction(${
            transaction.id
          })">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
        transactionsList.appendChild(li);
      });
  }

  // Habits Module
  setupHabitsModule() {
    const addHabitBtn = document.getElementById("add-habit");

    addHabitBtn.addEventListener("click", () => {
      const name = document.getElementById("habit-input").value.trim();
      if (name) {
        this.addHabit(name);
        document.getElementById("habit-input").value = "";
      }
    });
  }

  addHabit(name) {
    const habit = {
      id: Date.now(),
      name,
      completedDays: [],
      createdAt: new Date().toISOString(),
    };

    this.data.habits.push(habit);
    this.saveData();
    this.renderHabits();
  }

  toggleHabitDay(habitId, date) {
    const habit = this.data.habits.find((h) => h.id === habitId);
    if (habit) {
      const dateStr = date.toISOString().split("T")[0];
      const index = habit.completedDays.indexOf(dateStr);

      if (index > -1) {
        habit.completedDays.splice(index, 1);
      } else {
        habit.completedDays.push(dateStr);
      }

      this.saveData();
      this.renderHabits();
    }
  }

  renderHabits() {
    const container = document.getElementById("habits-container");
    container.innerHTML = "";

    this.data.habits.forEach((habit) => {
      const habitDiv = document.createElement("div");
      habitDiv.className = "habit-item";

      const streak = this.calculateStreak(habit.completedDays);
      const calendar = this.generateHabitCalendar(habit);

      habitDiv.innerHTML = `
        <div class="habit-header">
          <h3>${habit.name}</h3>
          <div class="item-actions">
            <span class="habit-streak">${streak} Tage</span>
            <button class="edit-btn" onclick="lifeManager.editHabit(${habit.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="lifeManager.deleteHabit(${habit.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="habit-calendar">${calendar}</div>
      `;

      container.appendChild(habitDiv);
    });
  }

  calculateStreak(completedDays) {
    if (completedDays.length === 0) return 0;

    const sortedDays = completedDays.sort();
    let streak = 0;
    const today = new Date();

    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = new Date(sortedDays[i]);
      const diffTime = today - day;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak || diffDays === streak + 1) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  generateHabitCalendar(habit) {
    const today = new Date();
    const calendar = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const isCompleted = habit.completedDays.includes(dateStr);
      const isToday = i === 0;

      calendar.push(`
        <div class="day ${isCompleted ? "completed" : ""} ${
        isToday ? "today" : ""
      }" 
             onclick="lifeManager.toggleHabitDay(${
               habit.id
             }, new Date('${date.toISOString()}'))">
          ${date.getDate()}
        </div>
      `);
    }

    return calendar.join("");
  }

  // Goals Module
  setupGoalsModule() {
    const addGoalBtn = document.getElementById("add-goal");

    addGoalBtn.addEventListener("click", () => {
      const text = document.getElementById("goal-input").value.trim();
      const deadline = document.getElementById("goal-deadline").value;

      if (text && deadline) {
        this.addGoal(text, deadline);
        document.getElementById("goal-input").value = "";
        document.getElementById("goal-deadline").value = "";
      }
    });
  }

  addGoal(text, deadline) {
    const goal = {
      id: Date.now(),
      text,
      deadline,
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.data.goals.push(goal);
    this.saveData();
    this.renderGoals();
  }

  updateGoalProgress(goalId, progress) {
    const goal = this.data.goals.find((g) => g.id === goalId);
    if (goal) {
      goal.progress = Math.max(0, Math.min(100, progress));
      this.saveData();
      this.renderGoals();
    }
  }

  renderGoals() {
    const container = document.getElementById("goals-container");
    container.innerHTML = "";

    this.data.goals.forEach((goal) => {
      const goalDiv = document.createElement("div");
      goalDiv.className = "goal-item";

      const daysLeft = Math.ceil(
        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      );

      goalDiv.innerHTML = `
        <div class="goal-header">
          <h3>${goal.text}</h3>
          <div class="item-actions">
            <span>${daysLeft} Tage verbleibend</span>
            <button class="edit-btn" onclick="lifeManager.editGoal(${goal.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="lifeManager.deleteGoal(${goal.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="goal-progress">
          <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
        </div>
        <div class="goal-actions">
          <input type="range" min="0" max="100" value="${goal.progress}" 
                 onchange="lifeManager.updateGoalProgress(${goal.id}, this.value)">
          <span>${goal.progress}%</span>
        </div>
      `;

      container.appendChild(goalDiv);
    });
  }

  // Notes Module
  setupNotesModule() {
    const addNoteBtn = document.getElementById("add-note");

    addNoteBtn.addEventListener("click", () => {
      const title = document.getElementById("note-title").value.trim();
      const content = document.getElementById("note-content").value.trim();

      if (title && content) {
        this.addNote(title, content);
        document.getElementById("note-title").value = "";
        document.getElementById("note-content").value = "";
      }
    });
  }

  addNote(title, content) {
    const note = {
      id: Date.now(),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    this.data.notes.push(note);
    this.saveData();
    this.renderNotes();
  }

  renderNotes() {
    const container = document.getElementById("notes-container");
    container.innerHTML = "";

    this.data.notes.reverse().forEach((note) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note-item";

      noteDiv.innerHTML = `
        <div class="note-content">
          <div class="note-title">${note.title}</div>
          <div class="note-text">${note.content}</div>
          <div class="note-date">${new Date(
            note.createdAt
          ).toLocaleDateString()}</div>
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick="lifeManager.editNote(${note.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" onclick="lifeManager.deleteNote(${
            note.id
          })">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      container.appendChild(noteDiv);
    });
  }

  // Time Tracker Module
  setupTimeModule() {
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.isRunning = false;

    document
      .getElementById("start-timer")
      .addEventListener("click", () => this.startTimer());
    document
      .getElementById("pause-timer")
      .addEventListener("click", () => this.pauseTimer());
    document
      .getElementById("stop-timer")
      .addEventListener("click", () => this.stopTimer());
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        this.updateTimerDisplay();
      }, 1000);
    }
  }

  pauseTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  stopTimer() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (this.timerSeconds > 0) {
      this.addTimeSession(this.timerSeconds);
      this.timerSeconds = 0;
      this.updateTimerDisplay();
    }
  }

  updateTimerDisplay() {
    const hours = Math.floor(this.timerSeconds / 3600);
    const minutes = Math.floor((this.timerSeconds % 3600) / 60);
    const seconds = this.timerSeconds % 60;

    document.getElementById("timer").textContent = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  addTimeSession(seconds) {
    const session = {
      id: Date.now(),
      duration: seconds,
      date: new Date().toISOString(),
    };

    this.data.timeSessions.push(session);
    this.saveData();
    this.renderTimeSessions();
  }

  renderTimeSessions() {
    const container = document.getElementById("sessions-list");
    container.innerHTML = "";

    this.data.timeSessions
      .slice(-10)
      .reverse()
      .forEach((session) => {
        const hours = Math.floor(session.duration / 3600);
        const minutes = Math.floor((session.duration % 3600) / 60);

        const li = document.createElement("li");
        li.className = "session-item";
        li.innerHTML = `
        <div>
          <strong>${hours}h ${minutes}m</strong>
          <div>${new Date(session.date).toLocaleDateString()}</div>
        </div>
      `;

        container.appendChild(li);
      });
  }

  // Mood Module
  setupMoodModule() {
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const mood = parseInt(e.target.dataset.mood);
        this.addMoodEntry(mood);

        // Update UI
        document
          .querySelectorAll(".mood-btn")
          .forEach((b) => b.classList.remove("selected"));
        e.target.classList.add("selected");
      });
    });

    // Update mood selection when module loads
    this.updateTodayMoodSelection();
  }

  addMoodEntry(mood) {
    const entry = {
      id: Date.now(),
      mood,
      date: new Date().toISOString(),
    };

    this.data.moodEntries.push(entry);
    this.saveData();
    this.renderMoodChart();
  }

  getMoodEmoji(mood) {
    const emojis = ["😢", "😕", "😐", "😊", "😄"];
    return emojis[mood - 1] || "😐";
  }

  renderMoodChart() {
    const container = document.getElementById("mood-chart");
    const recentEntries = this.data.moodEntries.slice(-7);

    if (recentEntries.length === 0) {
      container.innerHTML = "<p>Noch keine Stimmungseinträge</p>";
      return;
    }

    // Show today's mood prominently
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = this.data.moodEntries.find((entry) =>
      entry.date.startsWith(today)
    );

    let chart = "";

    if (todayEntry) {
      chart += `
        <div class="today-mood">
          <h4>Heute:</h4>
          <div class="mood-value-large">${this.getMoodEmoji(
            todayEntry.mood
          )}</div>
        </div>
      `;
    }

    // Show recent entries
    chart += recentEntries
      .map((entry) => {
        const date = new Date(entry.date);
        const isToday = entry.date.startsWith(today);
        return `
        <div class="mood-entry ${isToday ? "today" : ""}">
          <div class="mood-value">${this.getMoodEmoji(entry.mood)}</div>
          <div class="mood-date">${date.toLocaleDateString()}</div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = chart;

    // Mark today's mood as selected
    this.updateTodayMoodSelection();
  }

  updateTodayMoodSelection() {
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = this.data.moodEntries.find((entry) =>
      entry.date.startsWith(today)
    );

    // Remove all selections first
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    // Mark today's mood as selected if it exists
    if (todayEntry) {
      const moodBtn = document.querySelector(
        `[data-mood="${todayEntry.mood}"]`
      );
      if (moodBtn) {
        moodBtn.classList.add("selected");
      }
    }
  }

  // Health Module
  setupHealthModule() {
    document.getElementById("add-steps").addEventListener("click", () => {
      const steps = parseInt(document.getElementById("steps-input").value);
      if (steps) {
        this.addHealthData("steps", steps);
        document.getElementById("steps-input").value = "";
      }
    });

    document.getElementById("add-weight").addEventListener("click", () => {
      const weight = parseFloat(document.getElementById("weight-input").value);
      if (weight) {
        this.addHealthData("weight", weight);
        document.getElementById("weight-input").value = "";
      }
    });

    document.getElementById("add-water").addEventListener("click", () => {
      const water = parseInt(document.getElementById("water-input").value);
      if (water) {
        this.addHealthData("water", water);
        document.getElementById("water-input").value = "";
      }
    });
  }

  addHealthData(type, value) {
    const data = {
      id: Date.now(),
      type,
      value,
      date: new Date().toISOString(),
    };

    this.data.healthData.push(data);
    this.saveData();
    this.renderHealthData();
  }

  renderHealthData() {
    const container = document.getElementById("health-data");
    const recentData = this.data.healthData.slice(-10).reverse();

    container.innerHTML = "";

    recentData.forEach((data) => {
      const div = document.createElement("div");
      div.className = "health-entry";
      div.innerHTML = `
        <div>
          <strong>${data.type}: ${data.value}</strong>
          <div>${new Date(data.date).toLocaleDateString()}</div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // Learning Module
  setupLearningModule() {
    const addSkillBtn = document.getElementById("add-skill");

    addSkillBtn.addEventListener("click", () => {
      const skill = document.getElementById("skill-input").value.trim();
      const hours = parseFloat(document.getElementById("skill-hours").value);

      if (skill && hours) {
        this.addSkill(skill, hours);
        document.getElementById("skill-input").value = "";
        document.getElementById("skill-hours").value = "";
      }
    });
  }

  addSkill(skill, hours) {
    const existingSkill = this.data.skills.find((s) => s.name === skill);

    if (existingSkill) {
      existingSkill.totalHours += hours;
      existingSkill.sessions.push({
        hours,
        date: new Date().toISOString(),
      });
    } else {
      const newSkill = {
        id: Date.now(),
        name: skill,
        totalHours: hours,
        sessions: [
          {
            hours,
            date: new Date().toISOString(),
          },
        ],
      };
      this.data.skills.push(newSkill);
    }

    this.saveData();
    this.renderSkills();
  }

  renderSkills() {
    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    this.data.skills.forEach((skill) => {
      const skillDiv = document.createElement("div");
      skillDiv.className = "skill-item";

      const progress = Math.min(100, (skill.totalHours / 100) * 100); // 100 hours = 100%

      skillDiv.innerHTML = `
        <div class="skill-header">
          <h3>${skill.name}</h3>
          <div class="item-actions">
            <span>${skill.totalHours.toFixed(1)}h</span>
            <button class="edit-btn" onclick="lifeManager.editSkill(${
              skill.id
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="lifeManager.deleteSkill(${
              skill.id
            })">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="skill-progress">
          <div class="skill-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="skill-sessions">
          ${skill.sessions
            .slice(-3)
            .map(
              (session) =>
                `<div>${session.hours}h - ${new Date(
                  session.date
                ).toLocaleDateString()}</div>`
            )
            .join("")}
        </div>
      `;

      container.appendChild(skillDiv);
    });
  }

  // Utility functions
  isThisMonth(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  // Modal functionality
  setupModal() {
    this.currentEditItem = null;
    this.currentEditType = null;

    const modal = document.getElementById("edit-modal");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancel-edit");
    const saveBtn = document.getElementById("save-edit");

    // Close modal events
    closeBtn.addEventListener("click", () => this.closeModal());
    cancelBtn.addEventListener("click", () => this.closeModal());
    saveBtn.addEventListener("click", () => this.saveEdit());

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  openModal(title, formHTML) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-form").innerHTML = formHTML;
    document.getElementById("edit-modal").style.display = "block";
  }

  closeModal() {
    document.getElementById("edit-modal").style.display = "none";
    this.currentEditItem = null;
    this.currentEditType = null;
  }

  saveEdit() {
    if (!this.currentEditItem || !this.currentEditType) return;

    // Get form data manually since we're not using a real form element
    const form = document.getElementById("modal-form");
    const inputs = form.querySelectorAll("input, textarea, select");
    const data = {};

    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        data[input.name] = input.checked;
      } else if (input.type === "range") {
        data[input.name] = input.value;
      } else {
        data[input.name] = input.value;
      }
    });

    console.log("Form data:", data); // Debug

    switch (this.currentEditType) {
      case "todo":
        this.updateTodo(this.currentEditItem, data);
        break;
      case "transaction":
        this.updateTransaction(this.currentEditItem, data);
        break;
      case "habit":
        this.updateHabit(this.currentEditItem, data);
        break;
      case "goal":
        this.updateGoal(this.currentEditItem, data);
        break;
      case "note":
        this.updateNote(this.currentEditItem, data);
        break;
      case "skill":
        this.updateSkill(this.currentEditItem, data);
        break;
    }

    this.closeModal();
  }

  // Update functions for all modules
  updateTodo(id, data) {
    console.log("Updating todo:", id, data); // Debug
    const todo = this.data.todos.find((t) => t.id === id);
    if (todo) {
      todo.text = data.text;
      this.saveData();
      this.renderTodos();
      console.log("Todo updated successfully"); // Debug
    } else {
      console.log("Todo not found:", id); // Debug
    }
  }

  updateTransaction(id, data) {
    const transaction = this.data.transactions.find((t) => t.id === id);
    if (transaction) {
      transaction.description = data.description;
      transaction.amount =
        data.type === "expense"
          ? -parseFloat(data.amount)
          : parseFloat(data.amount);
      transaction.type = data.type;
      this.saveData();
      this.renderFinance();
    }
  }

  updateHabit(id, data) {
    const habit = this.data.habits.find((h) => h.id === id);
    if (habit) {
      habit.name = data.name;
      this.saveData();
      this.renderHabits();
    }
  }

  updateGoal(id, data) {
    const goal = this.data.goals.find((g) => g.id === id);
    if (goal) {
      goal.text = data.text;
      goal.deadline = data.deadline;
      goal.progress = parseInt(data.progress) || 0;
      this.saveData();
      this.renderGoals();
    }
  }

  updateNote(id, data) {
    const note = this.data.notes.find((n) => n.id === id);
    if (note) {
      note.title = data.title;
      note.content = data.content;
      this.saveData();
      this.renderNotes();
    }
  }

  updateSkill(id, data) {
    const skill = this.data.skills.find((s) => s.id === id);
    if (skill) {
      skill.name = data.name;
      this.saveData();
      this.renderSkills();
    }
  }

  // Delete functions
  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
    this.saveData();
    this.renderFinance();
  }

  deleteHabit(id) {
    this.data.habits = this.data.habits.filter((h) => h.id !== id);
    this.saveData();
    this.renderHabits();
  }

  deleteGoal(id) {
    this.data.goals = this.data.goals.filter((g) => g.id !== id);
    this.saveData();
    this.renderGoals();
  }

  deleteNote(id) {
    this.data.notes = this.data.notes.filter((n) => n.id !== id);
    this.saveData();
    this.renderNotes();
  }

  deleteSkill(id) {
    this.data.skills = this.data.skills.filter((s) => s.id !== id);
    this.saveData();
    this.renderSkills();
  }

  // Edit functions for all modules
  editTodo(id) {
    const todo = this.data.todos.find((t) => t.id === id);
    if (todo) {
      this.currentEditItem = id;
      this.currentEditType = "todo";
      const formHTML = `
        <div class="modal-form-group">
          <label for="text">Aufgabe:</label>
          <input type="text" name="text" value="${todo.text}" required>
        </div>
      `;
      this.openModal("To-Do bearbeiten", formHTML);
    }
  }

  editTransaction(id) {
    const transaction = this.data.transactions.find((t) => t.id === id);
    if (transaction) {
      this.currentEditItem = id;
      this.currentEditType = "transaction";
      const formHTML = `
        <div class="modal-form-group">
          <label for="description">Beschreibung:</label>
          <input type="text" name="description" value="${
            transaction.description
          }" required>
        </div>
        <div class="modal-form-group">
          <label for="amount">Betrag:</label>
          <input type="number" name="amount" value="${Math.abs(
            transaction.amount
          )}" step="0.01" required>
        </div>
        <div class="modal-form-group">
          <label for="type">Typ:</label>
          <select name="type">
            <option value="income" ${
              transaction.type === "income" ? "selected" : ""
            }>Einnahme</option>
            <option value="expense" ${
              transaction.type === "expense" ? "selected" : ""
            }>Ausgabe</option>
          </select>
        </div>
      `;
      this.openModal("Transaktion bearbeiten", formHTML);
    }
  }

  editHabit(id) {
    const habit = this.data.habits.find((h) => h.id === id);
    if (habit) {
      this.currentEditItem = id;
      this.currentEditType = "habit";
      const formHTML = `
        <div class="modal-form-group">
          <label for="name">Gewohnheit:</label>
          <input type="text" name="name" value="${habit.name}" required>
        </div>
      `;
      this.openModal("Gewohnheit bearbeiten", formHTML);
    }
  }

  editGoal(id) {
    const goal = this.data.goals.find((g) => g.id === id);
    if (goal) {
      this.currentEditItem = id;
      this.currentEditType = "goal";
      const formHTML = `
        <div class="modal-form-group">
          <label for="text">Ziel:</label>
          <input type="text" name="text" value="${goal.text}" required>
        </div>
        <div class="modal-form-group">
          <label for="deadline">Deadline:</label>
          <input type="date" name="deadline" value="${goal.deadline}" required>
        </div>
        <div class="modal-form-group">
          <label for="progress">Fortschritt (%):</label>
          <input type="range" name="progress" min="0" max="100" value="${goal.progress}">
          <span>${goal.progress}%</span>
        </div>
      `;
      this.openModal("Ziel bearbeiten", formHTML);
    }
  }

  editNote(id) {
    const note = this.data.notes.find((n) => n.id === id);
    if (note) {
      this.currentEditItem = id;
      this.currentEditType = "note";
      const formHTML = `
        <div class="modal-form-group">
          <label for="title">Titel:</label>
          <input type="text" name="title" value="${note.title}" required>
        </div>
        <div class="modal-form-group">
          <label for="content">Inhalt:</label>
          <textarea name="content" required>${note.content}</textarea>
        </div>
      `;
      this.openModal("Notiz bearbeiten", formHTML);
    }
  }

  editSkill(id) {
    const skill = this.data.skills.find((s) => s.id === id);
    if (skill) {
      this.currentEditItem = id;
      this.currentEditType = "skill";
      const formHTML = `
        <div class="modal-form-group">
          <label for="name">Fähigkeit:</label>
          <input type="text" name="name" value="${skill.name}" required>
        </div>
      `;
      this.openModal("Fähigkeit bearbeiten", formHTML);
    }
  }

  // Render all modules
  renderAllModules() {
    this.renderTodos();
    this.renderFinance();
    this.renderHabits();
    this.renderGoals();
    this.renderNotes();
    this.renderTimeSessions();
    this.renderMoodChart();
    this.renderHealthData();
    this.renderSkills();
  }
}

// Initialize the app
const lifeManager = new LifeManager();
