
export const processAnimalData = (rawData) => {
    if (!rawData) return [];
  
    return Object.entries(rawData).flatMap(([species, animals]) =>
      Object.entries(animals).map(([id, animal]) => {
        const latestTimestamp = Object.keys(animal.location).sort().pop();
        const latestTime = Object.keys(animal.location[latestTimestamp]).sort().pop();
        const location = animal.location[latestTimestamp][latestTime];
  
        return {
          id,
          species: species.slice(0, -1), // Remove 's' from end (e.g., "Elephants" -> "Elephant")
          name: animal.name,
          sex: animal.sex,
          age: animal.age,
          temp: location.temperature || 'N/A',
          activity: location.activity || 'N/A',
          location: {
            Lat: parseFloat(location.Lat),
            Lng: parseFloat(location.Long)
          },
          upload_interval: parseInt(animal.upload_interval) || 0,
          timestamp: latestTimestamp,
          time: latestTime
        };
      })
    );
  };
  
  export const processReportData = (rawData) => {
    if (!rawData) return [];
  
    return Object.entries(rawData).flatMap(([category, reports]) =>
      Object.entries(reports).map(([id, report]) => ({
        id,
        category,
        ...report,
        location: {
          Lat: parseFloat(report.location.Lat),
          Lng: parseFloat(report.location.Long)
        }
      }))
    );
  };
  
  export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTimeString(date)
    };
  };
  
  const getRelativeTimeString = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };