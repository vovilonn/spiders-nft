// ================ CONFIG ================

const endDate = new Date("2022-12-06T15:00:00.000Z");

// ========================================

function addZero(v) {
    return v < 10 && 0 <= v ? "0" + v : v;
}

function convertMilliseconds(ms) {
    const seconds = Math.floor((ms / 1000) % 60),
        minutes = Math.floor((ms / (1000 * 60)) % 60),
        hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
        days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 24);
    return { seconds, minutes, hours, days };
}

function getRemainingTime() {
    const countdown = endDate.getTime() - new Date().getTime();
    const { seconds, minutes, hours, days } = convertMilliseconds(countdown);
    return {
        days: addZero(days),
        hours: addZero(hours),
        minutes: addZero(minutes),
        seconds: addZero(seconds),
    };
}
