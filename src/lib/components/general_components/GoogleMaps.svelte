<script lang="ts">
    import { onMount } from 'svelte';

    export let onLocationSelect: (lat: number, lng: number, address: string) => void;
    let mapElement: HTMLElement;
    let map: google.maps.Map;
    let marker: google.maps.Marker;
    let geocoder: google.maps.Geocoder;
    let isLoading = true;
    let loadError = false;

    const initializeMap = () => {
        if (!mapElement || !window.google) return;
        
        try {
            const defaultLocation = { lat: 51.5074, lng: -0.1278 };
            geocoder = new google.maps.Geocoder();
            
            map = new google.maps.Map(mapElement, {
                center: defaultLocation,
                zoom: 13,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                gestureHandling: 'cooperative'
            });

            marker = new google.maps.Marker({
                position: defaultLocation,
                map: map,
                animation: google.maps.Animation.DROP
            });

            map.addListener('click', async (event: google.maps.MapMouseEvent) => {
                const lat = event.latLng?.lat();
                const lng = event.latLng?.lng();
                
                if (lat && lng) {
                    marker.setPosition({ lat, lng });
                    
                    try {
                        const result = await geocoder.geocode({
                            location: { lat, lng }
                        });
                        
                        if (result.results && result.results[0]) {
                            onLocationSelect(lat, lng, result.results[0].formatted_address);
                        } else {
                            onLocationSelect(lat, lng, "Address not found");
                        }
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        onLocationSelect(lat, lng, "Error getting address");
                    }
                }
            });
            isLoading = false;
        } catch (error) {
            console.error('Error initializing map:', error);
            loadError = true;
        }
    };

    onMount(() => {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBmVPb9Trr_5On8u4M1m13pHeBdAOEjCoM&libraries=places';
        script.async = true;
        script.onload = initializeMap;
        script.onerror = () => {
            loadError = true;
            isLoading = false;
        };
        document.head.appendChild(script);

        return () => {
            if (marker) marker.setMap(null);
        };
    });
</script>

<div class="w-full h-full rounded-lg relative">
    <div bind:this={mapElement} class="w-full h-full"></div>
    {#if isLoading}
        <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span class="text-gray-600">Loading map...</span>
        </div>
    {/if}
    {#if loadError}
        <div class="absolute inset-0 flex items-center justify-center bg-red-50">
            <span class="text-red-600">Failed to load Google Maps</span>
        </div>
    {/if}
</div>

<style>
    div {
        min-height: 400px;
    }
</style>