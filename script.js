const $=id=>document.getElementById(id);
const defaultCities=[{name:"New York",zone:Intl.DateTimeFormat().resolvedOptions().timeZone,country:"United States",code:"us"},{name:"Los Angeles",zone:"America/Los_Angeles",country:"United States",code:"us"},{name:"Chicago",zone:"America/Chicago",country:"United States",code:"us"},{name:"London",zone:"Europe/London",country:"United Kingdom",code:"gb"},{name:"Tokyo",zone:"Asia/Tokyo",country:"Japan",code:"jp"},{name:"Dubai",zone:"Asia/Dubai",country:"United Arab Emirates",code:"ae"}];
let cities=JSON.parse(localStorage.getItem("tc-cities")||"null")||defaultCities,use24=localStorage.getItem("tc-24")!=="false";
const zones=Intl.supportedValuesOf?Intl.supportedValuesOf("timeZone"):["Africa/Mogadishu","Europe/London",Intl.DateTimeFormat().resolvedOptions().timeZone,"Asia/Tokyo","Asia/Dubai"];
const fmt=(z,o={})=>new Intl.DateTimeFormat("en-US",{timeZone:z,...o}),time=z=>fmt(z,{hour:"2-digit",minute:"2-digit",hour12:!use24}).format(new Date()),date=z=>fmt(z,{weekday:"short",month:"short",day:"numeric"}).format(new Date());
const offset=z=>fmt(z,{timeZoneName:"longOffset"}).formatToParts(new Date()).find(p=>p.type==="timeZoneName")?.value.replace("GMT","UTC")||"UTC";
function diff(z){let d=new Date(),local=d.getTimezoneOffset(),s=fmt(z,{timeZoneName:"longOffset"}).formatToParts(d).find(p=>p.type==="timeZoneName")?.value||"GMT",m=s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/),n=m?(+m[2]*60+(+m[3]||0))*(m[1]==="-"?-1:1):0,v=n+local;return v===0?"Same time":`${v>0?"+":"−"}${Math.floor(Math.abs(v)/60)}h${Math.abs(v)%60?` ${Math.abs(v)%60}m`:""}`}
function render(){ $("clockGrid").innerHTML=cities.map((c,i)=>`<article class="clock-card"><div class="clock-top"><div><div class="city">${c.code?String.fromCodePoint(...c.code.toUpperCase().split("").map(x=>127397+x.charCodeAt(0))):"🌐"} ${c.name}</div><div class="country">${c.country||c.zone}</div></div><div class="card-actions"><button class="small-btn ${c.fav?"active":""}" data-fav="${i}">★</button><button class="small-btn" data-remove="${i}">×</button></div></div><div class="clock-time">${time(c.zone)}</div><div class="clock-bottom"><span>${date(c.zone)} · ${offset(c.zone)}</span><span class="day">${(+fmt(c.zone,{hour:"numeric",hour12:false}).format(new Date())>=19||+fmt(c.zone,{hour:"numeric",hour12:false}).format(new Date())<6)?"🌙 Night":"☀️ Day"} · ${diff(c.zone)}</span></div></article>`).join("");localStorage.setItem("tc-cities",JSON.stringify(cities))}
function updateClockTimes(){document.querySelectorAll(".clock-card").forEach((card,i)=>{let c=cities[i];if(!c)return;card.querySelector(".clock-time").textContent=time(c.zone);card.querySelector(".clock-bottom").innerHTML=`<span>${date(c.zone)} · ${offset(c.zone)}</span><span class="day">${(+fmt(c.zone,{hour:"numeric",hour12:false}).format(new Date())>=19||+fmt(c.zone,{hour:"numeric",hour12:false}).format(new Date())<6)?"🌙 Night":"☀️ Day"} · ${diff(c.zone)}</span>`})}
$("clockGrid").addEventListener("click",e=>{let f=e.target.dataset.fav,r=e.target.dataset.remove;if(f!==undefined){cities[f].fav=!cities[f].fav;cities.sort((a,b)=>(b.fav?1:0)-(a.fav?1:0)||a.name.localeCompare(b.name));render()}if(r!==undefined){cities.splice(+r,1);render()}});
function local(){
  let z=localStorage.getItem("tc-local-zone")||Intl.DateTimeFormat().resolvedOptions().timeZone;
  $("localTime").textContent=time(z);
  $("localDate").textContent=date(z);
}
fill("localZone",localStorage.getItem("tc-local-zone")||"America/New_York");
$("localZone").value=localStorage.getItem("tc-local-zone")||"America/New_York";
$("localZone").onchange=()=>{localStorage.setItem("tc-local-zone",$("localZone").value);local()};
$("formatBtn").onclick=()=>{use24=!use24;localStorage.setItem("tc-24",use24);$("formatBtn").textContent=use24?"24-hour":"12-hour";render();local()};$("formatBtn").textContent=use24?"24-hour":"12-hour";
function fill(id,initial){$(id).innerHTML=zones.map(z=>`<option ${z===initial?"selected":""} value="${z}">${z.replaceAll("_"," ")}</option>`).join("")}
["fromZone","toZone","meetingA","meetingB"].forEach((id,i)=>fill(id,[Intl.DateTimeFormat().resolvedOptions().timeZone,"Europe/London","Africa/Mogadishu","America/New_York"][i]));
function initDate(id){let d=new Date(),p=n=>String(n).padStart(2,"0");$(id).value=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
initDate("convertDate");initDate("meetingDate");
function conversion(v,a,b){let d=new Date(v);return `${fmt(a,{dateStyle:"full",timeStyle:"short"}).format(d)} (${a})<br><strong>${fmt(b,{dateStyle:"full",timeStyle:"short"}).format(d)} (${b})</strong>`}
$("convertBtn").onclick=()=> $("convertResult").innerHTML=conversion($("convertDate").value,$("fromZone").value,$("toZone").value);
$("meetingBtn").onclick=()=> $("meetingResult").innerHTML=conversion($("meetingDate").value,$("meetingA").value,$("meetingB").value);
let selected=null;const search=$("citySearch"),suggest=$("suggestions");
function citySearchEscape(v){
  return String(v??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",
    '"':"&quot;","'":"&#39;"
  }[c]));
}

function citySearchEscape(v){
  return String(v??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",
    '"':"&quot;","'":"&#39;"
  }[c]));
}

search.oninput=async()=>{
  let q=search.value.trim();
  selected=null;

  if(q.length<2){
    suggest.innerHTML="";
    return;
  }

  try{
    let r=await fetch("/api/cities?q="+encodeURIComponent(q));
    let data=await r.json();
    let arr=Array.isArray(data)?data:[];

    suggest.innerHTML=arr.slice(0,8).map(x=>{
      let name=x.city||x.name||"City";
      let country=x.country?.name||x.countryName||"";
      let zone=x.timezone||x.zone||x.timeZone||"";
      let code=(x.country?.iso2||x.countryCode||x.code||"").toLowerCase();

      return `<div class="suggestion"
        data-name="${citySearchEscape(name)}"
        data-zone="${citySearchEscape(zone)}"
        data-country="${citySearchEscape(country)}"
        data-code="${citySearchEscape(code)}">
        ${citySearchEscape(name)} · ${citySearchEscape(country)}
        <small>${citySearchEscape(zone)}</small>
      </div>`;
    }).join("")||'<div class="suggestion">No results found</div>';

  }catch{
    suggest.innerHTML='<div class="suggestion">Search service unavailable</div>';
  }
};

suggest.onclick=e=>{
  let x=e.target.closest(".suggestion");
  if(!x||!x.dataset.zone)return;

  selected={
    name:x.dataset.name,
    zone:x.dataset.zone,
    country:x.dataset.country,
    code:x.dataset.code
  };

  search.value=selected.name;
  suggest.innerHTML="";
};

$("addCity").onclick=()=>{let c=selected||{name:search.value.trim(),zone:search.value.trim(),country:"",code:""};if(!c.zone)return;if(!cities.some(x=>x.zone===c.zone)){cities.unshift(c);render()}search.value="";selected=null;suggest.innerHTML=""};
// Country list is derived from Intl's region/time-zone data; flag and details are shown for recognized ISO codes.
const countryNames=new Intl.DisplayNames(["en"],{type:"region"}),countryCodes="AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");
function flag(code){return code&&/^[A-Z]{2}$/.test(code)?String.fromCodePoint(...code.split("").map(c=>127397+c.charCodeAt(0))):"🌐"}
const countryList=countryCodes.map(code=>({code,name:countryNames.of(code)||code})).sort((a,b)=>a.code==="US"?-1:b.code==="US"?1:a.name.localeCompare(b.name));

function countryClockDate(zone){
  const match=zone.match(/^UTC([+-])(\d{2}):(\d{2})$/);

  if(!match){
    return new Intl.DateTimeFormat("en-US",{
      timeZone:zone,
      weekday:"long",
      month:"long",
      day:"numeric",
      year:"numeric"
    }).format(new Date());
  }

  const minutes=(Number(match[2])*60+Number(match[3]))*
    (match[1]==="-"?-1:1);

  return new Intl.DateTimeFormat("en-US",{
    timeZone:"UTC",
    weekday:"long",
    month:"long",
    day:"numeric",
    year:"numeric"
  }).format(new Date(Date.now()+minutes*60000));
}

function countryClockTime(zone){
  const match=zone.match(/^UTC([+-])(\d{2}):(\d{2})$/);

  if(!match){
    return new Intl.DateTimeFormat("en-US",{
      timeZone:zone,
      hour:"2-digit",
      minute:"2-digit",
      second:"2-digit",
      hour12:!use24
    }).format(new Date());
  }

  const minutes=(Number(match[2])*60+Number(match[3]))*
    (match[1]==="-"?-1:1);

  return new Intl.DateTimeFormat("en-US",{
    timeZone:"UTC",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hour12:!use24
  }).format(new Date(Date.now()+minutes*60000));
}

async function showCountry(c){
  const panel=$("countryDetails");
  panel.className="panel country-details show";
  panel.innerHTML=`
    <h3>${flag(c.code)} ${c.name}</h3>
    <p><b>Country code:</b> ${c.code}</p>
    <p>Loading country information...</p>`;

  try{
    const response=await fetch(
      "https://restcountries.com/v3.1/alpha/"+encodeURIComponent(c.code)
    );

    if(!response.ok)throw new Error("Country information unavailable");

    const results=await response.json();
    const data=results[0];
    const capital=data.capital?.[0]||"Not available";
    const population=data.population?.toLocaleString()||"Not available";
    const region=data.region||"Not available";
    const languages=Object.values(data.languages||{}).join(", ")||"Not available";
    const timezones=(data.timezones||[]).join(", ")||"Not available";
    const countryZones=data.timezones?.length?data.timezones:["UTC"];
    const mainTimezone=countryZones[0];

    panel.innerHTML=`
      <h3>${flag(c.code)} ${c.name}</h3>
      <p><b>Country code:</b> ${c.code}</p>
      <p><b>Capital:</b> ${capital}</p>
      <p><b>Population:</b> ${population}</p>
      <p><b>Region:</b> ${region}</p>
      <p><b>Languages:</b> ${languages}</p>
      <p><b>Time zones:</b> ${timezones}</p>
      <label for="countryTimezone">Choose a time zone:</label>
      <select id="countryTimezone">
        ${countryZones.map(z=>`<option value="${z}">${z}</option>`).join("")}
      </select>
      <div class="country-live-clock">
        <span>${flag(c.code)} ${c.name} — Current time</span>
        <strong id="countryLiveTime">${countryClockTime(mainTimezone)}</strong>
        <small id="countryLiveDate">${countryClockDate(mainTimezone)}</small>
        <small id="countryTimezoneLabel">${mainTimezone}</small>
      </div>
      <div class="country-all-clocks">
        <h4>All country time zones</h4>
        <div id="countryZoneClocks">
          ${countryZones.map(z=>`
            <div class="country-zone-clock">
              <span>${z}</span>
              <strong data-zone-clock="${z}">${countryClockTime(z)}</strong>
              <small data-zone-date="${z}">${countryClockDate(z)}</small>
            </div>
          `).join("")}
        </div>
      </div>`;
    panel.dataset.timezone=mainTimezone;

    $("countryTimezone").onchange=()=>{
      panel.dataset.timezone=$("countryTimezone").value;
      updateCountryLiveClock();
    };
  }catch(error){
    panel.innerHTML=`
      <h3>${flag(c.code)} ${c.name}</h3>
      <p><b>Country code:</b> ${c.code}</p>
      <p>Additional country information is temporarily unavailable.</p>`;
    console.error("Country information error:",error);
  }
}

function countryRender(q=""){
  const matches=countryList.filter(c=>
    c.name.toLowerCase().includes(q.trim().toLowerCase())||
    c.code.toLowerCase().includes(q.trim().toLowerCase())
  );

  $("countryGrid").innerHTML=matches.length
    ? matches.map(c=>`<div class="country-card" data-code="${c.code}"><span class="flag">${flag(c.code)}</span><span>${c.name}</span></div>`).join("")
    : '<p class="no-countries">No countries found. Try another name or country code.</p>';

  const counter=$("countryCount");
  if(counter){
    counter.textContent=matches.length+" countries found";
  }
}
const countrySelect=$("countrySelect");
countrySelect.innerHTML='<option value="">Choose a country...</option>'+countryList.map(c=>`<option value="${c.code}">${flag(c.code)} ${c.name}</option>`).join("");
countrySelect.onchange=async()=>{
  const country=countryList.find(c=>c.code===countrySelect.value);
  if(!country)return;

  showCountry(country);
  countryRender($("countrySearch")?.value || "");

  if(!map){
    console.error("Map is not initialized.");
    return;
  }

  try{
    const url="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&featuretype=country&q="+encodeURIComponent(country.name);
    const response=await fetch(url);
    const results=await response.json();

    if(!results.length){
      console.error("Could not find country on map:",country.name);
      return;
    }

    const place=results[0];
    const point=[Number(place.lat),Number(place.lon)];

    // Automatically fit the selected country's borders
    const selectedLayer = countryBorders
      ? countryBorders.getLayers().find(layer =>
          (layer.feature.properties["ISO3166-1-Alpha-2"] || "").toLowerCase() === country.code.toLowerCase()
        )
      : null;

    if(selectedLayer){
      map.fitBounds(selectedLayer.getBounds(),{
        padding:[35,35],
        maxZoom:8,
        animate:true
      });
    }else{
      map.setView(point,5);
    }

    // Highlight the selected country's actual borders
    if(countryBorders){
      countryBorders.eachLayer(layer=>{
        const properties=layer.feature.properties;
        const code=(properties["ISO3166-1-Alpha-2"]||"").toLowerCase();

        layer.setStyle({
          color:code===country.code?"#c4b5fd":"#77738f",
          weight:code===country.code?3:1,
          fillColor:code===country.code?"#a78bfa":"#a78bfa",
          fillOpacity:code===country.code?0.35:0.04
        });
      });

      countryBorders.bringToFront();
    }

    if(mapMarker)map.removeLayer(mapMarker);

    mapMarker=L.marker(point).addTo(map)
      .bindPopup(flag(country.code)+" "+country.name)
      .openPopup();

  }catch(error){
    console.error("Country map search failed:",error);
  }
};
$("countryGrid").onclick=e=>{
  const card=e.target.closest(".country-card");
  if(card){
    const country=countryList.find(c=>c.code===card.dataset.code);
    if(country){
      countrySelect.value=country.code;
      countrySelect.dispatchEvent(new Event("change"));
    }
  }
};

const countrySearch=$("countrySearch");

if(countrySearch){
  countrySearch.addEventListener("input",()=>{
    countryRender(countrySearch.value);
  });
}

countryRender();
showCountry(countryList.find(c=>c.code==="US"));
countrySelect.value="US";

var map;
var mapMarker=null;
var countryBorders=null;

async function loadCountryBorders(){
  try{
    const response=await fetch("/data/countries.geojson");
    if(!response.ok)throw new Error("Could not load country data");

    const geoData=await response.json();

    countryBorders=L.geoJSON(geoData,{
      style:{
        color:"#a78bfa",
        weight:1,
        fillColor:"#a78bfa",
        fillOpacity:0.06
      },
      onEachFeature:(feature,layer)=>{
        layer.on("click",()=>{
          const code=(feature.properties["ISO3166-1-Alpha-2"]||"").toLowerCase();
          const country=countryList.find(c=>c.code.toLowerCase()===code);

          if(country){
            countrySelect.value=country.code;
            countrySelect.dispatchEvent(new Event("change"));
          }
        });
      }
    }).addTo(map);

  }catch(error){
    console.error("Country borders failed to load:",error);
  }
}


if(window.L){
  map=L.map("map").setView([10,20],2);
  loadCountryBorders();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"© OpenStreetMap contributors",
    maxZoom:19
  }).addTo(map);


  map.on("click",async e=>{
    const lat=e.latlng.lat;
    const lon=e.latlng.lng;

    if(mapMarker)map.removeLayer(mapMarker);
    mapMarker=L.marker([lat,lon]).addTo(map)
      .bindPopup("Searching location…").openPopup();

    try{
      const response=await fetch(
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat="+lat+"&lon="+lon
      );
      const data=await response.json();
      const address=data.address||{};
      const name=address.city||address.town||address.village||
                 address.county||address.state||"Selected location";
      const country=address.country||"";
      const display=name+(country?", "+country:"");

      mapMarker.setPopupContent(
        "<b>"+display+"</b><br>"+
        lat.toFixed(4)+", "+lon.toFixed(4)+
        "<br><small>Searching timezone…</small>"
      );

      $("citySearch").value=name;
      selected=null;

      const cityResponse=await fetch("/api/cities?q="+encodeURIComponent(name));
      const cityData=await cityResponse.json();
      const results=Array.isArray(cityData)?cityData:
        (cityData.results||cityData.cities||[]);

      const match=results.find(x=>
        (x.timezone||x.zone||x.timeZone)&&
        (x.name||x.city||"").toLowerCase()===name.toLowerCase()
      )||results.find(x=>x.timezone||x.zone||x.timeZone);

      if(match){
        selected={
          name:match.name||match.city||name,
          zone:match.timezone||match.zone||match.timeZone,
          country:match.country||country,
          code:(match.countryCode||match.code||"").toLowerCase()
        };

        mapMarker.setPopupContent(
          "<b>"+display+"</b><br>"+
          "Timezone: "+selected.zone+
          "<br><button onclick='document.getElementById(\"addCity\").click()'>Add Clock</button>"
        );
      }else{
        mapMarker.setPopupContent(
          "<b>"+display+"</b><br>"+
          "No timezone result found.<br>"+
          "Search the city above to add its clock."
        );
      }
    }catch(error){
      mapMarker.setPopupContent("Location lookup failed. Try again.");
    }
  });

  setTimeout(()=>map.invalidateSize(),300);
}
$("year").textContent=new Date().getFullYear();render();local();setInterval(()=>{updateClockTimes();local()},1000);
// TimeConnect Favorites Filter
(function(){
  const grid=document.getElementById("clockGrid");
  if(!grid)return;

  const btn=document.createElement("button");
  btn.id="favoritesFilter";
  btn.textContent="⭐ Show Favorites";
  btn.style.cssText="margin:12px 0;padding:12px 18px;border-radius:10px;border:0;background:#7c3aed;color:white;cursor:pointer;font-size:15px";
  grid.parentNode.insertBefore(btn,grid);

  let favoritesOnly=false;

  function applyFilter(){
    [...grid.querySelectorAll(".clock-card")].forEach((card,i)=>{
      card.style.display=(!favoritesOnly||cities[i]?.fav)?"":"none";
    });
    btn.textContent=favoritesOnly?"🌍 Show All Clocks":"⭐ Show Favorites";
  }

  btn.onclick=()=>{
    favoritesOnly=!favoritesOnly;
    applyFilter();
  };

  const originalRender=render;
  render=function(){
    originalRender();
    applyFilter();
  };
})();

// TimeConnect Smart Map Search
if (window.L && document.getElementById("mapSearchBtn")) {
  const mapSearch = document.getElementById("mapSearch");
  const mapSearchBtn = document.getElementById("mapSearchBtn");
  const mapSuggestions = document.getElementById("mapSuggestions");

  mapSearchBtn.onclick = async () => {
    const query = mapSearch.value.trim();
    if (!query) return;

    mapSearchBtn.textContent = "Searching...";
    mapSearchBtn.disabled = true;

    try {
      const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" +
        encodeURIComponent(query);

      const response = await fetch(url);
      const results = await response.json();

      if (!results.length) {
        mapSuggestions.textContent = "Location not found. Try another search.";
        return;
      }

      const place = results[0];
      const lat = Number(place.lat);
      const lon = Number(place.lon);
      const type = place.type || "";

      // Cities zoom closer; countries zoom farther.
      let zoom = 10;
      if (type === "country") zoom = 5;
      else if (type === "city" || type === "town" || type === "village") zoom = 11;

      map.setView([lat, lon], zoom);

      if (mapMarker) map.removeLayer(mapMarker);

      mapMarker = L.marker([lat, lon]).addTo(map);
      mapMarker.bindPopup("<b>" + place.display_name + "</b>").openPopup();

      mapSuggestions.textContent = "Found: " + place.display_name;
    } catch {
      mapSuggestions.textContent = "Search failed. Please try again.";
    } finally {
      mapSearchBtn.textContent = "Find on map";
      mapSearchBtn.disabled = false;
    }
  };

  mapSearch.addEventListener("keydown", e => {
    if (e.key === "Enter") mapSearchBtn.click();
  });
}


// TimeConnect: Reset world map
const resetMapBtn = $("resetMapBtn");

if(resetMapBtn){
  resetMapBtn.onclick=()=>{
    if(!map)return;

    map.setView([10,20],2);

    if(mapMarker){
      map.removeLayer(mapMarker);
      mapMarker=null;
    }

    if(countryBorders){
      countryBorders.eachLayer(layer=>{
        layer.setStyle({
          color:"#77738f",
          weight:1,
          fillColor:"#a78bfa",
          fillOpacity:0.04
        });
      });
    }

    countrySelect.value="";
    $("countryDetails").className="panel country-details";
  };
}

// TimeConnect: Full-screen map
const fullMapBtn = $("fullMapBtn");

if(fullMapBtn){
  fullMapBtn.onclick=()=>{
    const mapElement=$("map");

    if(!document.fullscreenElement){
      mapElement.requestFullscreen().then(()=>{
        setTimeout(()=>map.invalidateSize(),200);
        fullMapBtn.textContent="✕ Exit full screen";
      }).catch(error=>{
        console.error("Full-screen error:",error);
      });
    }else{
      document.exitFullscreen();
    }
  };

  document.addEventListener("fullscreenchange",()=>{
    const active=document.fullscreenElement===$("map");
    fullMapBtn.textContent=active?"✕ Exit full screen":"⛶ Full screen map";
    setTimeout(()=>map.invalidateSize(),200);
  });
}

// TimeConnect: Locate visitor on map
const locateMeBtn = $("locateMeBtn");

if(locateMeBtn){
  locateMeBtn.onclick=()=>{
    if(!navigator.geolocation){
      alert("Location is not supported by this browser.");
      return;
    }

    locateMeBtn.textContent="Finding location...";
    locateMeBtn.disabled=true;

    navigator.geolocation.getCurrentPosition(
      position=>{
        const lat=position.coords.latitude;
        const lon=position.coords.longitude;

        map.setView([lat,lon],13);

        if(mapMarker)map.removeLayer(mapMarker);

        mapMarker=L.marker([lat,lon]).addTo(map)
          .bindPopup("Your current location")
          .openPopup();

        locateMeBtn.textContent="◎ Locate me";
        locateMeBtn.disabled=false;
      },
      error=>{
        alert("Location unavailable. Please allow location access in your browser.");
        locateMeBtn.textContent="◎ Locate me";
        locateMeBtn.disabled=false;
      },
      {enableHighAccuracy:false,timeout:10000}
    );
  };
}

function updateCountryLiveClock(){
  const panel=$("countryDetails");
  const zone=panel?.dataset.timezone;
  if(!zone)return;

  const clock=$("countryLiveTime");
  const calendar=$("countryLiveDate");
  const label=$("countryTimezoneLabel");

  if(clock)clock.textContent=countryClockTime(zone);
  if(calendar)calendar.textContent=countryClockDate(zone);
  if(label)label.textContent=zone;

  document.querySelectorAll("[data-zone-clock]").forEach(item=>{
    const timezone=item.dataset.zoneClock;
    item.textContent=countryClockTime(timezone);
  });

  document.querySelectorAll("[data-zone-date]").forEach(item=>{
    const timezone=item.dataset.zoneDate;
    item.textContent=countryClockDate(timezone);
  });
}

setInterval(updateCountryLiveClock,1000);
