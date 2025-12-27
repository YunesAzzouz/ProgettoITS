const API_KEY = '8538788ed3e43a05b6ec6dcbb2c76068';
const citySelect = document.getElementById('city');
const forecastDiv = document.getElementById('forecast');

async function fetchWeather(city) {
    forecastDiv.innerHTML = "<p>Caricamento in corso...</p>";

    const URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},IT&units=metric&lang=it&appid=${API_KEY}`;

    try {
    const res = await fetch(URL);
    const data = await res.json();

    if (data.cod !== "200") {
        forecastDiv.innerHTML = "<p>Errore nel caricamento delle previsioni.</p>";
        return;
    }

    const grouped = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
    });

    forecastDiv.innerHTML = "";
    Object.keys(grouped).slice(0, 5).forEach(date => {
        const entries = grouped[date];
        const temps = entries.map(i => i.main.temp);
        const avgTemp = Math.round(temps.reduce((a, b) => a + b) / temps.length);
        const desc = entries[0].weather[0].description;
        const icon = entries[0].weather[0].icon;

        const formattedDate = new Date(date).toLocaleDateString("it-IT", {
        weekday: "long", day: "numeric", month: "long"
        });

        forecastDiv.innerHTML += `
        <div class="forecast-item">
            <h3>${formattedDate}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
            <p><strong>${avgTemp}°C</strong></p>
            <p>${desc}</p>
        </div>
        `;
    });

    } catch (error) {
    console.error("Errore nel caricamento delle previsioni:", error);
    forecastDiv.innerHTML = "<p>Errore nel caricamento dei dati meteo.</p>";
    }
}

citySelect.addEventListener("change", (e) => {
    fetchWeather(e.target.value);
});

fetchWeather(citySelect.value);