// Configurer la carte
let config = {
  minZoom: 7,
  maxZoom: 18,
  zoomControl: false, // zoom control off
  // https://github.com/Leaflet/Leaflet.fullscreen
  fullscreenControl: true,
};

// Niveau de zoom initial
const zoom = 7.5;

// Coordonnées
const lat = 7.53998;
const lng = -5.54709;

// Créer la carte
const map = L.map("map", config).setView([lat, lng], zoom);

// Activer le contrôle de zoom en haut à gauche
L.control.zoom({ position: "topleft" }).addTo(map);

// Définition du texte pour le contrôle du texte
const text = "RECENSEMENT GENERAL DE LA POPULATION EN COTE D'IVOIRE 1998";

// Création du contrôle du texte
function createTextControl(text) {
  const textControl = L.control({ position: "topright" });

  textControl.onAdd = function () {
    const container = L.DomUtil.create("div", "text-control");
    container.textContent = text;

    return container;
  };

  return textControl;
}

// Ajout du contrôle du texte à la carte
const textControl = createTextControl(text);
textControl.addTo(map);

// Définition des liens pour le contrôle des dates
const links = [
  { label: "1975", url: "rgphci75.html" },
  { label: "1998", url: "rgphci98.html" },
  { label: "2014", url: "rgphci14.html" },
];

// Création du contrôle des dates
function createTitleControl(links) {
  const titleControl = L.control({ position: "topleft" });

  titleControl.onAdd = function () {
    const container = L.DomUtil.create("div", "title-control");

    links.forEach((link) => {
      const button = document.createElement("button");
      button.textContent = link.label;
      button.addEventListener("click", function () {
        // Supprimer la classe "active" de tous les boutons
        container.querySelectorAll("button").forEach((btn) => {
          btn.classList.remove("active");
        });

        // Ajouter la classe "active" au bouton cliqué
        button.classList.add("active");

        window.location.href = link.url;
      });

      container.appendChild(button);
    });

    return container;
  };

  return titleControl;
}

// Ajout du contrôle des dates à la carte
const titleControl = createTitleControl(links);
titleControl.addTo(map);

const CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
}).addTo(map);

const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{ 
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const htmlTemplate =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';

// create custom button
const customControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
  },

  // method
  onAdd: function (map) {
    console.log(map.getCenter());
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "back to home";
    btn.innerHTML = htmlTemplate;
    btn.className += "leaflet-bar back-to-home hidden";

    return btn;
  },
});

// adding new button to map controll
map.addControl(new customControl());

// on drag end
map.on("moveend", getCenterOfMap);

const buttonBackToHome = document.querySelector(".back-to-home");

function getCenterOfMap() {
  buttonBackToHome.classList.remove("hidden");

  buttonBackToHome.addEventListener("click", () => {
    map.flyTo([lat, lng], zoom);
  });

  map.on("moveend", () => {
    const { lat: latCenter, lng: lngCenter } = map.getCenter();

    const latC = latCenter.toFixed(3) * 1;
    const lngC = lngCenter.toFixed(3) * 1;

    const defaultCoordinate = [+lat.toFixed(3), +lng.toFixed(3)];

    const centerCoordinate = [latC, lngC];

    if (compareToArrays(centerCoordinate, defaultCoordinate)) {
      buttonBackToHome.classList.add("hidden");
    }
  });
}

const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Contrôle de couches
const baselayerLayers ={
  "CartoDB":CartoDB_Voyager,
  "OpenStreetMap":osm,
};
// Échelle graphique de la carte
L.control.scale({
  imperial: false,
}).addTo(map);

//add coordinates controls
L.control.coordinates({
  position:"bottomright",
  decimals:5,
  decimalSeperator:",",
  labelTemplateLat:"Latitude: {y}",
  labelTemplateLng:"Longitude: {x}"
}).addTo(map);


 //instance fenêtre modale
 const info = L.control({ position: "bottomright" });

 info.onAdd = function () {
   const div = L.DomUtil.create("div", "description");
   L.DomEvent.disableClickPropagation(div);
   const text = 
     "<button type='button' class='infomodal' data-bs-toggle='modal' data-bs-target='#infoModal'>Information</button>";
   div.insertAdjacentHTML("beforeend", text);
   return div;
 };
 info.addTo(map);



//Ajout fichier geoJSON population 1998 
const geojsonPop =  L.geoJSON(pop1998JSON, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 8, fillColor: '#333333', color: '#ffffff', weight: 3, opacity: 1,fillOpacity: 1
  });
  },
  onEachFeature: function(feature, layer) {
    const customPopup = L.popup({
    className: 'custom-popup'});
    customPopup.setContent(
        '<div>'+ '<h4>' + feature.properties.localite + '</h4>' +'</div>' +'<div class="table">'+
          '<table>'+
                 '<tr>'+'<th>District: </th>'+'<td>'+feature.properties.district+'</td>'+'</tr>'+
                 '<tr>'+'<th>Region: </th>'+'<td>'+feature.properties.region+'</td>'+'</tr>'+
                 '<tr>'+'<th>Sous-préfecture : </th>'+'<td>'+feature.properties.sp+'</td>'+'</tr>'+
                 '<tr>'+'<th>Hommes : </th>'+'<td>'+feature.properties.hommes+'</td>'+'</tr>'+
                 '<tr>'+'<th>Femmes : </th>'+'<td>'+ feature.properties.femmes+'</td>'+'</tr>'+
                 '<tr>'+'<th>Population Total: </th>'+'<td>'+feature.properties.poptotal+'</td>'+'</tr>'+
          '</table>'+
         '</div>'
         );
    layer.bindPopup(customPopup,{closeButton:false});
  }
});

//Ajout fichier geoJSON RG 1998
const geojsonLayer4 = L.geoJSON(region1998Json, {
  
  style:function(feature) {
    return {
      color: '#232323',
      weight: 2,
      fillColor: 'blue',
      fillOpacity: 0
    };
  },
  onEachFeature: function (feature, layer) {
    layer.on("mouseover", function (e) {
      // style
      this.setStyle({
        fillColor: "#eb4034",
        weight: 5,
      });
    });
    layer.on("mouseout", function () {
      // style
      this.setStyle({
        color: '#232323',
        weight: 2,
        fillColor: 'blue',
        fillOpacity: 0
      });
    });
    
    const properties = feature.properties;
    const popupContent = `
       <h4>${properties.LIBREG}</h4>
    `;
    layer.bindPopup(popupContent);

  }  
});

//Ajout fichier geoJSON DPT 1998
const geojsonLayer3 = L.geoJSON(deprt1998Json, {
  
  style:function(feature) {
    return {
      color: '#666666',
      weight: 1.5,
      fillOpacity: 0
    };
  },
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
       <h4>${properties.NOM}</h4>
    `;
    layer.bindPopup(popupContent);
  }  
});

//Ajout fichier geoJSON SP 1998
const geojsonLayer2 = L.geoJSON(sp1998Json, {
  
  style:function(feature) {
    return {
      color: '#818181',
      weight: 0.5,
      fillColor: '#d5f2e0',
      fillOpacity: 0.5
    };
  },
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
       <h4>${properties.NOM}</h4>
    `;
    layer.bindPopup(popupContent);
  }  
});

const overlayLayers = {
  "Population en 1998": geojsonPop,
  "Sous-préfectures 1998": geojsonLayer2,
  "Déprtements 1998": geojsonLayer3,
  "Régions 1998": geojsonLayer4,
    
  };

  const geojsonLayer1 = L.markerClusterGroup();
  

  const layerControl = L.control.layers(baselayerLayers, null, { collapsed: false });
  layerControl.addTo(map);

  // Ajouter les couches GeoJSON à la carte
  geojsonLayer1.addLayer(geojsonPop)
  geojsonLayer2.addTo(map);
  geojsonLayer3.addTo(map);
  geojsonLayer4.addTo(map);


//barre de recherche
const searchControl = new L.Control.Search({
  position: 'topright',
  layer: geojsonLayer1,
  propertyName: 'localite', // le nom de la propriété à rechercher
  textPlaceholder: 'Recherchez une localité...',
  textErr: 'Pas de résultat trouvé!',
  zoom: 14,
  marker:false,
  collapsed: false,
  
});

searchControl.on('search:locationfound', function(e) {
  const layer = e.layer;
  layer.openPopup();
});

map.addControl(searchControl);

// Control de l'affichage personnalisé des couche vecteurs
const customControlWindow = L.Control.extend({
  onAdd: function () {
    const div = L.DomUtil.create("div", "description-layer");
    L.DomEvent.disableClickPropagation(div);
   
    const switch1 = createSwitchToggle("layer1", "Localités", true);
    const switch2 = createSwitchToggle("layer2", "Limites Sous-préfectures", true);
    const switch3 = createSwitchToggle("layer3", "Limites Départements", true);
    const switch4 = createSwitchToggle("layer4", "Limites Regions", true);


    div.appendChild(switch1);
    div.appendChild(switch2);
    div.appendChild(switch3);
    div.appendChild(switch4);

    // Variables pour suivre l'état des couches
    let layer1Visible = true;
    let layer2Visible = true;
    let layer3Visible = true;
    let layer4Visible = true;

    // Ajouter les gestionnaires d'événements
    switch1.addEventListener("change", function () {
      layer1Visible = !layer1Visible;
      if (layer1Visible) {
        map.addLayer(geojsonLayer1);
      } else {
        map.removeLayer(geojsonLayer1);
      }
    });

    switch2.addEventListener("change", function () {
      layer2Visible = !layer2Visible;
      if (layer2Visible) {
        map.addLayer(geojsonLayer2);
      } else {
        map.removeLayer(geojsonLayer2);
      }
    });

    switch3.addEventListener("change", function () {
      layer3Visible = !layer3Visible;
      if (layer3Visible) {
        map.addLayer(geojsonLayer3);
      } else {
        map.removeLayer(geojsonLayer3);
      }
    });

    switch4.addEventListener("change", function () {
      layer4Visible = !layer4Visible;
      if (layer4Visible) {
        map.addLayer(geojsonLayer4);
      } else {
        map.removeLayer(geojsonLayer4);
      }
    });

    return div;
  },
});

// Fonction utilitaire pour créer un commutateur à bascule
function createSwitchToggle(id, label, checked) {
  const switchToggle = document.createElement("label");
  switchToggle.classList.add("switch");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.id = id;

  const slider = document.createElement("span");
  slider.classList.add("slider");

  const item = document.createElement("span");
  item.textContent = label;

  switchToggle.appendChild(input);
  switchToggle.appendChild(slider);
  switchToggle.appendChild(item);

  return switchToggle;
}

// Ajouter la fenêtre de contrôle personnalisée à la carte
map.addControl(new customControlWindow());


// Ajouter l'info des droits à la carte
const copyright = L.control({ position: "bottomleft" });

copyright.onAdd = function () {
   let div = L.DomUtil.create("div", "description-copyright");
   L.DomEvent.disableClickPropagation(div);
   const text = 
     "<b>©Copyright 2023 CAPDEV. Tous droits reversés.</b>";
   div.insertAdjacentHTML("beforeend", text);
   return div;
 };
 copyright.addTo(map);




