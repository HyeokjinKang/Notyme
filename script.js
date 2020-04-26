let reminders;
let notifications = [];
let delRecord;

const yyyymmdd = (date) => {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
};

const tomorrow = (date) => {
    date.setDate(date.getDate() + 1);
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
};

const nameSubmit = () => {
    localStorage.name = document.getElementById('nameBox').value;
    initialize();
};

const initialize = () => {
    if(Notification.permission !== 'granted') {
        document.getElementById('alertGrantBox').style.display = 'flex';
    }
    document.getElementById('title').textContent = `Hi, ${localStorage.name}!`;
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('topDisplayBox').style.height = '13vh';
    setTimeout(() => {
        document.getElementById('topDisplayBox').style.transitionDelay = '0s';
        document.getElementById('topDisplayBox').style.transitionDuration = '0s';
    }, 100);
    const date = new Date();
    document.getElementById('dateInput').min = yyyymmdd(date);
    document.getElementById('dateInput').value = yyyymmdd(date);
};

const alertGrant = () => {
    Notification.requestPermission(result => {
        if (result == 'granted') {
            setTimeout(() => {
                document.getElementById('alertGrantBox').style.display = 'none';
            },1000);
            document.getElementById('alertGrantBox').style.opacity = '0';
            return;
        } else {
            document.getElementById('alertGrantBox').style.backgroundColor = '#f44842';
            setTimeout(() => {
                document.getElementById('alertGrantBox').style.backgroundColor = '#999';
            },1000);
            return;
        }
    });
};

const autoDelete = () => {
    let funcReminders = JSON.parse(localStorage.reminders);
    let d = new Date();
    datetext = d.toTimeString();
    datetext = datetext.split(' ')[0].split(':');
    datetext = yyyymmdd(d).replace(/-/g, '') + datetext[0] + datetext[1];
    for(let i = 0; i < funcReminders.length; i++) {
        let time = funcReminders[i].time.split(':');
        let date = funcReminders[i].date.replace(/-/g, '');
        if(time[0] == '00') {
            time[0] = '12';
        } else if(time[0] == '12') {
            time[0] = '24';
        }
        time = date + time[0] + time[1];
        if(time - datetext <= 0) {
            delRecord = i;
            deleteReminder();
        }
    }
    if(localStorage.reminders) {
        return true;
    }
};

const update = () => {
    document.getElementById('notiElementsContainer').innerHTML = '';
    if(localStorage.reminders) {
        if(autoDelete()) {
            let funcReminders = JSON.parse(localStorage.reminders);
            reminders = JSON.parse(localStorage.reminders);
            document.getElementById('notiElementsContainer').innerHTML = '';
            for(let i = 0; i < funcReminders.length; i++) {
                let time = funcReminders[i].time.split(':');
                let ampm;
                if(time[0] - 12 < 0) {
                    ampm = 'am';
                    time = time[0] + ':' + time[1];
                } else {
                    ampm = 'pm';
                    if(time[0] == 12) {
                        time = time[0] + ':' + time[1];
                    } else {
                        time = time[0] - 12 + ':' + time[1];
                    }
                }
                let dateTime = new Date();
                dateTime = yyyymmdd(dateTime);
                let day;
                if(dateTime == funcReminders[i].date) {
                    day = 'today';
                } else if(tomorrow(new Date()) == funcReminders[i].date) {
                    day = 'tomorrow';
                } else {
                    day = funcReminders[i].date;
                }
                document.getElementById('notiElementsContainer').innerHTML = document.getElementById('notiElementsContainer').innerHTML + `<div class="notiElement" onclick="deleteRecord(event, ${i})"><span class="notiElementName">${funcReminders[i].title}</span><br><span class="notiElementTime">${time} ${ampm}, ${day}</span><div class="notiElementBottom"><span class="notification">Notification</span><input id="chkbox${i}" type="checkbox" class="chkbox" checked></div></div>`;
                if(notifications[i]) {
                    clearTimeout(notifications[i]);
                }
                notifications[i] = setTimeout(() => {
                    notiVisible();
                }, new Date(`${funcReminders[i].date} ${funcReminders[i].time}:00`).getTime() - new Date().getTime());
            }
        }
    }
};

const sortReminders = () => {
    let funcReminders = JSON.parse(localStorage.reminders);
    let sortNum = [];
    let replaceText = '[';
    for(let i = 0; i < funcReminders.length; i++) {
        sortNum[i] = funcReminders[i].date.replace(/-/g, '') + funcReminders[i].time.replace(':', '') + i;
    }
    sortNum.sort();
    for(let i = 0; i < sortNum.length; i++) {
        sortNum[i] = sortNum[i].slice(-1);
        replaceText = `${replaceText}{"title": "${funcReminders[sortNum[i]].title}", "date": "${funcReminders[sortNum[i]].date}", "time": "${funcReminders[sortNum[i]].time}"}, `;
    }
    replaceText = replaceText.slice(0, -2) + ']';
    localStorage.reminders = replaceText;
};

const notiVisible = () => {
    let funcReminders = JSON.parse(localStorage.reminders);
    if(document.getElementById(`chkbox0`).checked) {
        let notification = new Notification("Notyme", {body: funcReminders[0].title});
        update();
    }
};

const newSchedule = () => {
    document.getElementById('newOverlay').style.display = 'flex';
};

const cancelSchedule = () => {
    document.getElementById('newOverlay').style.display = 'none';
};

const saveSchedule = () => {
    if(document.getElementById('titleBox').value.replace(/\s/g, '') !== '') {
        let newRecord = `{"title": "${document.getElementById('titleBox').value}", "date": "${document.getElementById('dateInput').value}", "time": "${document.getElementById('timeInput').value}"}`;
        let dateTime = new Date();
        let time = dateTime.toTimeString().split(' ')[0].split(':');
        time = time[0] + time[1];
        let settingTime = document.getElementById('dateInput').value.replace(/-/g, '') + document.getElementById('timeInput').value.replace(':', '');
        time = yyyymmdd(dateTime).replace(/-/g, '') + time;
        if(settingTime.replace(':', '') - time <= 0) {
            alert('You have entered the same or earlier time.');
        } else {
            if(check()) {
                if(localStorage.reminders) {
                    localStorage.reminders = localStorage.reminders.slice(0, -1) + `, ${newRecord}]`;
                } else {
                    localStorage.reminders = `[${newRecord}]`;
                }
                document.getElementById('titleBox').value = '';
                let date = new Date();
                document.getElementById('dateInput').min = yyyymmdd(date);
                document.getElementById('dateInput').value = yyyymmdd(date);
                document.getElementById('timeInput').value = '12:00';
                document.getElementById('newOverlay').style.display = 'none';
                sortReminders();
                update();
            } else {
                alert('There is a reminder with duplicate names or times.');
            }
        }
    } else {
        alert('Names can not be stored as spaces.');
    }
};

const check = () => {
    if(reminders) {
        for(let i = 0; i < reminders.length; i++) {
            if(document.getElementById('titleBox').value == reminders[i].title) {
                return false;
            }
            if(document.getElementById('timeInput').value.replace(':', '') == reminders[i].time.replace(':', '')) {
                return false;
            }
        }
    }
    return true;
};

const deleteRecord = (event, id) => {
    if(event.target.className !== 'chkbox') {
        delRecord = id;
        document.getElementById('deleteOverlay').style.display = 'flex';
    }
};

const cancelDelete = () => {
    document.getElementById('deleteOverlay').style.display = 'none';
};

const deleteReminder = () => {
    let funcReminders = JSON.parse(localStorage.reminders);
    if(funcReminders.length == 1) {
        localStorage.removeItem('reminders');
    } else {
        let recordValue = '[';
        for(let i = 0; i < funcReminders.length; i++) {
            if(i !== delRecord) {
                recordValue = recordValue + `{"title": "${funcReminders[i].title}", "date": "${funcReminders[i].date}", "time": "${funcReminders[i].time}"},`;
            }
        }
        recordValue = recordValue.slice(0, -1) + ']';
        localStorage.reminders = recordValue;
    }
    document.getElementById('deleteOverlay').style.display = 'none';
    update();
};

window.onload = () => {
    if(localStorage.name) initialize();
};
update();