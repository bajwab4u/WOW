import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from 'mapbox-gl-geocoder';
import { BusinessApiService } from 'projects/wow-business/src/app/services/business.api.service';
import { SharedHelper } from 'shared/common/shared.helper.functions';


@Component({
	selector: 'wow-shared-map',
	templateUrl: './shared-map.component.html',
	styleUrls: ['./shared-map.component.scss']
})
export class SharedMapComponent implements OnInit
{
	@Input() baseUrl: string;
	@Input() mapAccessToken: string;
	@Output() addressEvent = new EventEmitter();
	@Output() zipcodeEvent = new EventEmitter();
	@Output() cityEvent = new EventEmitter();
	@Output() stateEvent = new EventEmitter();
	@Output() coordinatesEvent = new EventEmitter();
	@Output() countryEvent = new EventEmitter();
	@Input() location = {
		coordinates: [],
		address: ''
	}
	customerLocData: any = {
		coordinates: [],
		address: ''
	};
	showWarning = false;
	showSuccess = false;

	constructor(private businessAdmin: BusinessApiService) 
	{
		this.baseUrl = null;
	}

	ngOnInit(): void 
	{
		if (this.location.coordinates.length) {
			this.customerLocData = this.location;
			const coords = {
				lat: this.customerLocData.coordinates[1],
				lng: this.customerLocData.coordinates[0]
			};
			this.getAddressAgainstCoords(this, coords);
			this.getZipCodeAgainstCoords(this, coords);
			this.getCountryAgainstCoords(this, coords);
			this.coordinatesEvent.emit(coords);
			this.initializeMap();
		} 
		else {

			SharedHelper.getPosition().then(res => {
				console.log(res);
				const coordinates = [res.lng, res.lat];
				this.customerLocData.coordinates = coordinates;
				const coords = {
					lat: this.customerLocData.coordinates[1],
					lng: this.customerLocData.coordinates[0]
				};

				this.getAddressAgainstCoords(this, coords);
				this.getZipCodeAgainstCoords(this, coords);
				this.getCountryAgainstCoords(this, coords);
				this.coordinatesEvent.emit(coords);
				this.initializeMap();
				// const modalRef = this.ngbModel.open(SharedMapComponent,
				//   { size: 'lg', backdrop: 'static', centered: true, windowClass: 'sizeXL' }); // open the modal
				// modalRef.componen = coordinates;
				// modalRef.result.then((data) => {

				// });
			});
		}
	}

	ngOnChanges(): void {
		//Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
		//Add '${implements OnChanges}' to the class.

	}

	initializeMap() {
		var parent = this;
		// initilize the map with center loction and zoom level
		
		Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(this.mapAccessToken);
		const map: any = new mapboxgl.Map({
			container: 'testmap', // container id
			style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
			center: this.customerLocData.coordinates, // starting position [lng, lat]
			zoom: 12 // starting zoom
		});
		// geo coder for searching
		const geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken
		});

		map.addControl(geocoder);
		map.addControl(new mapboxgl.NavigationControl());
		// setting the store and customer location popups
		// const customerPopup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false, className: 'my-class', offset: 15 })
		//   .setHTML('<h5>You are here</h5> ')
		//   .addTo(map)
		//   .setLngLat(this.customerLocData.coordinates);


		// setting the jeoJson for customerPoint
		const coordinates = document.getElementById('coordinates');
		const canvas: any = map.getCanvasContainer();
		const geojson: any = {
			'type': 'FeatureCollection',
			'features': [
				{
					'type': 'Feature',
					'geometry': {
						'type': 'Point',
						'coordinates': this.customerLocData.coordinates
					}
				}
			]
		};

		// when point is moved with cursor, we need to move the customerpoptoo
		// function onMove(e) {

		//   const coords = e.lngLat;
		//   customerPopup.setLngLat(coords);  // set the customer popUp coordinates
		//   console.log('onmove', coords);
		//   canvas.style.cursor = 'grabbing';
		//   geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
		//   map.getSource('point').setData(geojson);
		// }
		// when a mouse is clicked for a postion
		// function onUp(e: { lngLat: any; }) {
		//   const coords = e.lngLat;
		//   parent.customerLocData.coordinates = coords; // update customer coordinates on each move
		//   parent.getAddressAgainstCoords(parent, coords);
		//   parent.getCountryAgainstCoords(parent, coords);
		//   parent.getZipCodeAgainstCoords(parent, coords);
		//   parent.coordinatesEvent.emit(coords);
		//   // parent.getAddressAgainstCoords(parent, coords);
		//   // parent.checkNearByStore(parent, coords);
		//   // wil get the address against the latitude and longitude

		//   // Print the coordinates of where the point had
		//   // finished being dragged to on the map.
		//   coordinates.style.display = 'block';
		//   coordinates.innerHTML = 'Longitude: ' + coords.lng + '<br />Latitude: ' + coords.lat;
		//   canvas.style.cursor = '';

		//   // Unbind mouse/touch events
		//   map.off('mousemove', onMove);
		//   map.off('touchmove', onMove);
		// }
		map.on('load', function () {
			// Add a single point to the map
			// map.addSource('point', {
			//   'type': 'geojson',
			//   'data': geojson
			// });
			// // create the marker for store
			// map.addLayer({
			//   'id': 'point',
			//   'type': 'circle',
			//   'source': 'point',
			//   'paint': {
			//     'circle-radius': 12,
			//     'circle-color': '#3887be'
			//   }
			// });

			// // When the cursor enters a feature in the point layer, prepare for dragging.
			// map.on('mouseenter', 'point', function () {
			//   map.setPaintProperty('point', 'circle-color', '#3bb2d0');
			//   canvas.style.cursor = 'move';
			// });
			// map.on('mouseleave', 'point', function () {
			//   map.setPaintProperty('point', 'circle-color', '#3887be');
			//   canvas.style.cursor = '';
			// });
			// map.on('mousedown', 'point', function (e) {
			//   // Prevent the default map drag behavior.
			//   e.preventDefault();

			//   canvas.style.cursor = 'grab';

			//   map.on('mousemove', onMove);
			//   map.once('mouseup', onUp);
			// });
			// map.on('touchstart', 'point', function (e) {
			//   if (e.points.length !== 1) return;
			//   // Prevent the default map drag behavior.
			//   e.preventDefault();

			//   map.on('touchmove', onMove);
			//   map.once('touchend', onUp);
			// });
			// Listen for the `result` event from the MapboxGeocoder that is triggered when a user
			// makes a selection and add a symbol that matches the result.
			geocoder.on('result', function (ev) {
				console.log('after searhing ', ev.result);
				if (ev.result) {
					// map.getSource('point').setData(ev.result.geometry);
					// customerPopup.setLngLat(ev.result.geometry.coordinates);  // set the customer popUp coordinates
					parent.customerLocData.coordinates = ev.result.geometry.coordinates;
					const coords = {
						lng: ev.result.geometry.coordinates[0],
						lat: ev.result.geometry.coordinates[1]
					}

					parent.getAddressAgainstCoords(parent, coords);
					parent.getCountryAgainstCoords(parent, coords);
					parent.getZipCodeAgainstCoords(parent, coords);
					console.log(ev.result.place_name, 'address');
					parent.coordinatesEvent.emit(coords);
					parent.customerLocData.address = ev.result.place_name ? ev.result.place_name : ''; /// set the address of customer
					// parent.checkNearByStore(parent, {lat: ev.result.geometry.coordinates[1], lng: ev.result.geometry.coordinates[1] });
				}

			});
			// parent.checkNearByStore(parent, {lat: parent.customerLocData.coordinates[1], lng: parent.customerLocData.coordinates[0] });
		});
	}



	saveCustomerLocation() {
		if (this.showWarning) {
			return
		}
		if (this.showSuccess) {


			// this.activeModal.close(this.customerLocData);
		}
	}

	getAddressAgainstCoords(parent, coords) {
		console.log(coords);
		parent.businessAdmin.getAdressofLocation(coords.lng, coords.lat).subscribe(result => {
			console.log('places found', result);
			const address = (result && result.features && result.features.length && result.features[0].place_name) ? result.features[0].place_name : '';
			parent.customerLocData.address =
			  (result && result.features && result.features.length && result.features[0].place_name) ? result.features[0].place_name : '';
			
			const locationsArray = (result && result.features && result.features.length && result.features[0].context) ? result.features[0].context : [];
			const locations = locationsArray.filter(city => city.id && city.id.includes('place'));
			const states = locationsArray.filter(state => state.id && state.id.includes('region'));
			const city = locations.length && locations[0].text ? locations[0].text : null;
	  
			let fAddress: string = '';
			if (address) {
			  if (city && address.includes(city)) {
				const add = address.split(city);
				fAddress = add && add.length > 0 ? add[0] : address;
				console.log('Address => ', add);
			  }
			  else {
				fAddress = address;
			  }
			}
			
			// parent.addressEvent.emit(parent.customerLocData.address);
			parent.addressEvent.emit(fAddress);
		});
	}

	getZipCodeAgainstCoords(parent, coords) {
		console.log(coords);
		if (parent && parent.hasOwnProperty('businessAdmin') && parent.businessAdmin)
		{
			parent.businessAdmin.getzipcodeofLocation(coords.lng, coords.lat).subscribe(result => {
				console.log('zipcode found', result);
				parent.customerLocData.zipCode =
					(result && result.features && result.features.length && result.features[0].text) ? result.features[0].text : '';
				parent.zipcodeEvent.emit(parent.customerLocData.zipCode);
			});
		}
	}

	getCountryAgainstCoords(parent, coords) {
		console.log(coords);
		if (parent && parent.hasOwnProperty('businessAdmin') && parent.businessAdmin)
		{
			parent.businessAdmin.getCountryNameOfLocation(coords.lng, coords.lat).subscribe(result => {
				console.log('country found', result);
				const countryName =
					(result && result.features && result.features.length && result.features[0].place_name) ? result.features[0].place_name : '';
				if (countryName && countryName !== '') {
					const arr = countryName.split(",");
					console.log(arr, 'array');
					parent.cityEvent.emit(arr[0]);
					parent.stateEvent.emit(arr[1]);
					parent.countryEvent.emit(arr[2]);
				}

				// parent.checkNearByStore(parent, countryName)
			});
		}
	}
}
