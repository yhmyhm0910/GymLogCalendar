import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const Test = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update every second to reflect live time
    return () => clearInterval(interval);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Month is zero-based
  const day = currentDate.getDate();
  const second = currentDate.getSeconds();
  const dayOfWeek = currentDate.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.

  return (
    <View>
      <Text>Current Date: {year}-{month}-{day}</Text>
      <Text>Day of the Week: {getDayName(dayOfWeek)}</Text>
      <Text>Second: {second}</Text>
    </View>
  );
};

const getDayName = (dayIndex: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

export default Test;
