class GymTracker {
    constructor() {
        this.weights = this.loadData('weights') || {};
        this.workouts = this.loadData('workouts') || [];
        this.timer = {
            time: 90,
            interval: null,
            isRunning: false
        };
        this.currentDay = 1;
        
        this.init();
    }

    init() {
        this.setupiOSCompatibility();
        this.setupTabs();
        this.setupDaySelector();
        this.setupTimer();
        this.setupConsistency();
        this.renderExercises();
        this.updateConsistencyStats();
    }

    setupiOSCompatibility() {
        // Prevent zoom on double-tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Fix iOS Safari viewport height issues
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });

        // Request notification permission on iOS
        if ('Notification' in window && Notification.permission === 'default') {
            // Don't auto-request on iOS, let user trigger it
            const requestBtn = document.createElement('button');
            requestBtn.textContent = 'Habilitar notificaciones';
            requestBtn.style.cssText = `
                display: none;
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 8px 12px;
                background: #1a202c;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
            `;
            requestBtn.onclick = () => {
                Notification.requestPermission();
                requestBtn.style.display = 'none';
            };
            document.body.appendChild(requestBtn);
        }
    }

    loadData(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    }

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    getRoutineData() {
        return {
            1: [
                { name: "Sentadilla con barra", sets: "4x8-10", video: "https://www.youtube.com/watch?v=Dy28eq2PjcM" },
                { name: "Peso muerto rumano", sets: "4x10", video: "https://www.youtube.com/watch?v=2SHsk9AzdjA" },
                { name: "Hip thrust", sets: "4x12", video: "https://www.youtube.com/watch?v=yM3lCdQBGmA" },
                { name: "Estocadas", sets: "3x12 por pierna", video: "https://www.youtube.com/watch?v=QOVaHwm-Q6U" },
                { name: "Abducción en máquina", sets: "3x15", video: "https://www.youtube.com/watch?v=YaZ3dWfUQcQ" }
            ],
            2: [
                { name: "Press banca plano con mancuernas", sets: "4x8-10", video: "https://www.youtube.com/watch?v=VmB1G1K7v94" },
                { name: "Press militar sentado", sets: "4x10", video: "https://www.youtube.com/watch?v=B-aVuyhvLHU" },
                { name: "Extensión de tríceps", sets: "3x12", video: "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q" },
                { name: "Aperturas en banco inclinado", sets: "3x12", video: "https://www.youtube.com/watch?v=eozdVDA78K0" },
                { name: "Plancha frontal", sets: "3x40s", video: "https://www.youtube.com/watch?v=pSHjTRCQxIw" }
            ],
            3: [
                { name: "Hack squat", sets: "4x8-10", video: "https://www.youtube.com/watch?v=EdtaJRBqkls" },
                { name: "Prensa inclinada", sets: "4x12", video: "https://www.youtube.com/watch?v=IZxyjW7MPJQ" },
                { name: "Búlgaras", sets: "3x10 por pierna", video: "https://www.youtube.com/watch?v=2C-uNgKwPLE" },
                { name: "Extensiones de cuádriceps", sets: "3x15", video: "https://www.youtube.com/watch?v=YyvSfVjQeL0" },
                { name: "Gemelos de pie en máquina", sets: "4x15-20", video: "https://www.youtube.com/watch?v=3jgzM5cUzT8" }
            ],
            4: [
                { name: "Jalón al pecho", sets: "4x8-10", video: "https://www.youtube.com/watch?v=CAwf7n6Luuc" },
                { name: "Remo con polea", sets: "4x10", video: "https://www.youtube.com/watch?v=UCXxvVItLoM" },
                { name: "Face pull", sets: "3x15", video: "https://www.youtube.com/watch?v=rep-qVOkqgk" },
                { name: "Curl bíceps mancuernas", sets: "3x12", video: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo" },
                { name: "Superman en colchoneta", sets: "3x15", video: "https://www.youtube.com/watch?v=cc6UVRS7PW4" }
            ],
            5: [
                { name: "Peso muerto sumo", sets: "4x6-8", video: "https://www.youtube.com/watch?v=LGIS9vs65Sk" },
                { name: "Hip thrust pesado", sets: "4x8-10", video: "https://www.youtube.com/watch?v=yM3lCdQBGmA" },
                { name: "Step-ups en banco", sets: "3x12 por pierna", video: "https://www.youtube.com/watch?v=dQqApCGd5Ss" },
                { name: "Abducción en polea", sets: "3x15 cada uno", video: "https://www.youtube.com/watch?v=YaZ3dWfUQcQ" }
            ]
        };
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(t => t.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    setupDaySelector() {
        const dayBtns = document.querySelectorAll('.day-btn');
        
        dayBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const day = parseInt(btn.dataset.day);
                
                dayBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentDay = day;
                this.renderExercises();
            });
        });
    }

    renderExercises() {
        const container = document.getElementById('exercises');
        const routine = this.getRoutineData();
        const dayExercises = routine[this.currentDay] || [];
        
        container.innerHTML = '';
        
        dayExercises.forEach((exercise, index) => {
            const exerciseKey = `${this.currentDay}-${index}`;
            const currentWeight = this.weights[exerciseKey] || '';
            
            const div = document.createElement('div');
            div.className = 'exercise-item';
            div.innerHTML = `
                <h3 class="exercise-name">${exercise.name}</h3>
                <p class="exercise-sets">${exercise.sets}</p>
                <div class="exercise-controls">
                    <input 
                        type="number" 
                        class="weight-input" 
                        placeholder="Peso (kg)"
                        value="${currentWeight}"
                        data-exercise="${exerciseKey}"
                        step="0.5"
                        min="0"
                    >
                    <a href="${exercise.video}" target="_blank" class="exercise-link">Ver video</a>
                </div>
            `;
            
            container.appendChild(div);
        });
        
        const weightInputs = container.querySelectorAll('.weight-input');
        weightInputs.forEach(input => {
            // iOS input handling
            input.addEventListener('input', (e) => {
                const exerciseKey = e.target.dataset.exercise;
                const weight = e.target.value;
                
                if (weight) {
                    this.weights[exerciseKey] = weight;
                } else {
                    delete this.weights[exerciseKey];
                }
                
                this.saveData('weights', this.weights);
            });
            
            // iOS focus handling to prevent page jumping
            input.addEventListener('focus', (e) => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            // iOS blur handling
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            });
        });
    }

    setupTimer() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.timer.time = parseInt(btn.dataset.time);
                this.resetTimer();
                this.updateTimerDisplay();
            });
        });
        
        startBtn.addEventListener('click', () => this.startTimer());
        pauseBtn.addEventListener('click', () => this.pauseTimer());
        resetBtn.addEventListener('click', () => {
            const activePreset = document.querySelector('.preset-btn.active');
            if (activePreset) {
                this.timer.time = parseInt(activePreset.dataset.time);
            }
            this.resetTimer();
            this.updateTimerDisplay();
        });
        
        this.updateTimerDisplay();
    }

    startTimer() {
        if (this.timer.isRunning) return;
        
        this.timer.isRunning = true;
        this.timer.interval = setInterval(() => {
            this.timer.time--;
            this.updateTimerDisplay();
            
            if (this.timer.time <= 0) {
                this.resetTimer();
                this.playNotification();
                alert('¡Tiempo de descanso terminado!');
                
                const activePreset = document.querySelector('.preset-btn.active');
                if (activePreset) {
                    this.timer.time = parseInt(activePreset.dataset.time);
                    this.updateTimerDisplay();
                }
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isRunning = false;
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
        }
    }

    resetTimer() {
        this.timer.isRunning = false;
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.time / 60);
        const seconds = this.timer.time % 60;
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    playNotification() {
        // iOS Safari notification fallback
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('¡Tiempo de descanso terminado!');
        } else {
            // Visual alert for iOS
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #1a202c;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 1000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            alertDiv.textContent = '¡Tiempo de descanso terminado!';
            document.body.appendChild(alertDiv);
            
            // Vibrate if supported
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 3000);
        }
    }

    setupConsistency() {
        this.renderCalendar();
        this.updateConsistencyStats();
        
        document.getElementById('mark-workout').addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            if (!this.workouts.includes(today)) {
                this.workouts.push(today);
                this.saveData('workouts', this.workouts);
                this.renderCalendar();
                this.updateConsistencyStats();
            }
        });
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = '600';
            dayHeader.style.color = '#718096';
            dayHeader.style.fontSize = '12px';
            dayHeader.style.textAlign = 'center';
            dayHeader.style.padding = '8px';
            calendar.appendChild(dayHeader);
        });
        
        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            const dateString = date.toISOString().split('T')[0];
            if (this.workouts.includes(dateString)) {
                dayElement.classList.add('workout');
            }
            
            calendar.appendChild(dayElement);
        }
    }

    updateConsistencyStats() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const thisMonth = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0');
        const thisWeekWorkouts = this.getWeekWorkouts(startOfWeek);
        const thisMonthWorkouts = this.workouts.filter(date => date.startsWith(thisMonth)).length;
        const streak = this.calculateStreak();
        
        document.getElementById('week-workouts').textContent = `${thisWeekWorkouts}/5`;
        document.getElementById('month-workouts').textContent = thisMonthWorkouts;
        document.getElementById('current-streak').textContent = `${streak} días`;
    }

    getWeekWorkouts(startOfWeek) {
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            if (this.workouts.includes(dateString)) {
                count++;
            }
        }
        return count;
    }
    
    calculateStreak() {
        if (this.workouts.length === 0) return 0;
        
        const sortedDates = [...this.workouts].sort().reverse();
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        if (sortedDates[0] === today || sortedDates[0] === this.getYesterday()) {
            let currentDate = new Date(sortedDates[0]);
            
            for (const dateStr of sortedDates) {
                const workoutDate = new Date(dateStr);
                const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 1) {
                    streak++;
                    currentDate = workoutDate;
                } else {
                    break;
                }
            }
        }
        
        return streak;
    }
    
    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

}

const gymTracker = new GymTracker();