const GOOGLE_API_KEY = 'AIzaSyA8zYrIvk6sgeP0EHHPeq5TPfTOheAregM';

export const mapsService = {
  autocompletePlace: async (input: string) => {
    if (input.length < 2) return [];
    
    try {
      // Usamos un proxy CORS 
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&types=(cities)&language=es`;
      
      const response = await fetch(proxyUrl + apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        return data.predictions || [];
      }
      return getFallbackSuggestions(input);
      
    } catch (error) {
      console.error('Error en la petición de autocompletado:', error);
      console.log('Usando datos de respaldo');
      return getFallbackSuggestions(input);
    }
  }
};

function getFallbackSuggestions(input: string) {
  const allCities = [
    { place_id: '1', description: 'Medellín, Antioquia, Colombia' },
    { place_id: '2', description: 'Bogotá, Colombia' },
    { place_id: '3', description: 'Cali, Valle del Cauca, Colombia' },
    { place_id: '4', description: 'Barranquilla, Atlántico, Colombia' },
    { place_id: '5', description: 'Cartagena, Bolívar, Colombia' },
    { place_id: '6', description: 'Cúcuta, Norte de Santander, Colombia' },
    { place_id: '7', description: 'Bucaramanga, Santander, Colombia' },
    { place_id: '8', description: 'Pereira, Risaralda, Colombia' },
    { place_id: '9', description: 'Santa Marta, Magdalena, Colombia' },
    { place_id: '10', description: 'Manizales, Caldas, Colombia' },
    { place_id: '11', description: 'Buenos Aires, Argentina' },
    { place_id: '12', description: 'Ciudad de México, México' },
    { place_id: '13', description: 'Madrid, España' },
    { place_id: '14', description: 'Lima, Perú' },
    { place_id: '15', description: 'Santiago, Chile' }
  ];
  
  return allCities.filter(city => 
    city.description.toLowerCase().includes(input.toLowerCase())
  );
}