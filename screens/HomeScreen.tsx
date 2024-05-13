import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, Dimensions, ViewProps, TouchableOpacity, Modal, Button, Image, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { useHeaderHeight } from '@react-navigation/elements';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { FIREBASE_READ_USER_DOC, FIREBASE_WRITE_TO_USER_DOC } from '../firebaseConfig';

const HomeScreen: React.FC = () => {

  const pageRendered = useRef(false);
  const navigation = useNavigation();

  const monthsInitBeforeCurrent = 12*5; // = init current month index

  const all_exercises = [
    {part: 'Back', exercises: ['Lat Pull Down', 'T-Bar Row']}, 
    {part: 'Chest', exercises: ['Bench Press', 'DB Bench Press', 'Machine Chest Fly']},
    {part: 'Bicep', exercises: ['DB Curl']},
    {part: 'Tricep', exercises: ['Tricep Pushdown']},
    {part: 'Leg', exercises: ['Sled Leg Press', 'Lying Leg Curl']},
    {part: 'Core', exercises: ['Decline Crunch']},
    {part: 'Shoulder', exercises: ['Lateral Raise', 'Face Pull']}
  ];
  const exercises_icons = [
    {exercise: 'Lat Pull Down', icon: require('../assets/gym-icon/lat-pulldown-icon.webp')},
    {exercise: 'T-Bar Row', icon: require('../assets/gym-icon/t-bar-row-icon.webp')},
    {exercise: 'Bench Press', icon: require('../assets/gym-icon/bench-press-icon.webp')},
    {exercise: 'Machine Chest Fly', icon: require('../assets/gym-icon/machine-chest-fly-icon.webp')},
    {exercise: 'DB Curl', icon: require('../assets/gym-icon/dumbbell-curl-icon.webp')},
    {exercise: 'Tricep Pushdown', icon: require('../assets/gym-icon/tricep-pushdown-icon.webp')},
    {exercise: 'Sled Leg Press', icon: require('../assets/gym-icon/sled-leg-press-icon.webp')},
    {exercise: 'Lying Leg Curl', icon: require('../assets/gym-icon/lying-leg-curl-icon.webp')},
    {exercise: 'Decline Crunch', icon: require('../assets/gym-icon/decline-crunch-icon.webp')},
    {exercise: 'Lying Leg Curl', icon: require('../assets/gym-icon/lying-leg-curl-icon.webp')},
    {exercise: 'Lateral Raise', icon: require('../assets/gym-icon/lateral-raise-icon.webp')},
    {exercise: 'Face Pull', icon: require('../assets/gym-icon/face-pull-icon.webp')},

    // TODO: Add more
  ]
  
  const initFalseArray = (all_exercises: any) => {
    let fill: boolean[][] = [];
    for (let i=0; i<all_exercises.length; i++) {
      fill[i] = [];
      for (let j=0; j<all_exercises[i].exercises.length; j++) {
        fill[i].push(false);
      }
    }
    return fill;
  }
  const initZeroArray = (all_exercises: any) => {
    let fill: number[][] = [];
    for (let i=0; i<all_exercises.length; i++) {
      fill[i] = [];
      for (let j=0; j<all_exercises[i].exercises.length; j++) {
        fill[i].push(0);
      }
    }
    return fill;
  }

  const [isChosenExercise, setIsChosenExercise] = useState<boolean[][]>(initFalseArray(all_exercises));
  const [weight_Exercise, setWeight_Exercise] = useState<number[][]>(initZeroArray(all_exercises));
  const [sets_Exercise, setSets_Exercise] = useState<number[][]>(initZeroArray(all_exercises));

  const [exercises_selected, setExercises_selected] = useState<string[]>([]);

  // Time-related
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  // const [currentDay, setCurrentDay] = useState<number>(0);
  // const [currentDayOfWeek, setCurrentDayOfWeek] = useState<number>(0);
  
  // Style-related
  const headerHeight = useHeaderHeight();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { height } = Dimensions.get('window');

  // Appending-months-related
  const [currentIndex, setCurrentIndex] = useState<number>(0);  // will change to 1 in init useEffect
  const [addedMonths, setAddedMonths] = useState<React.ReactElement<ViewProps>[][]>([]);  // [][0] = calendarHeader, [][1] = first week etc.

  // Adding activity related
  const [pageState, setPageState] = useState<number>(0);
  const [state, setState] = useState<number>(0);
  const [daySelected, setDaySelected] = useState<number>(0);

  interface docFetched {
    date: {
      day: number;
      month: number;
      year: number;
    };
    exercise: string;
    reps: number;
    weight: number;
  };
  const renderCalendar = (state: number, docFetched: docFetched[]): React.ReactElement<ViewProps>[] => {  // state = 0 when current month
    console.log('ffffff: ', docFetched);

    const dayOneOfMonth = new Date(currentYear, currentMonth + state, 1).getDay();  // first weekday of this month (Sunday=0)
    const lastDateOfLastMonth =new Date(currentYear, currentMonth + state, 0).getDate();  // last day of last month (28, 29, 30, 31)
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1 + state, 0).getDate(); // last day of this month (28, 29, 30, 31)
    const calendarViewHeight = height - headerHeight;

    const checkSavedWorkouts = (dayRendering: number, renderingMonth: number) => {
      const lastYearDec_state = - currentMonth - 1; // -5 (May 2024), -17, -29 ...
      const nextYearJan_state = 12 - currentMonth;  // 8 (May 2024), 20, 32 ...
      
      let yearRendering;
      if (state <= lastYearDec_state) {
        yearRendering = currentYear + Math.floor((state - lastYearDec_state - 1)/12);  //  TOFIX
      } else if (state >= nextYearJan_state) {
        yearRendering = currentYear + Math.ceil((state - nextYearJan_state + 1)/12);  //  TODO: (Optional) not append more than one year now
      } else {
        yearRendering = currentYear;
      }

      let monthRendering = (currentMonth + state) % 12;
      if (monthRendering < 0) {
        monthRendering = 12 + monthRendering; 
      } 
      
      monthRendering += renderingMonth;

      console.log(`state: ${state}, YYYY-MM-DD: ${yearRendering}-${monthRendering}-${dayRendering}`) // TODO

      const viewsReturning: React.ReactElement<ViewProps>[] = [];
      for (let i=0; i<docFetched.length; i++) { // loop through all exercise
        if (yearRendering === docFetched[i].date.year &&  // if the record's day == rendering day
          monthRendering === docFetched[i].date.month && 
          dayRendering === docFetched[i].date.day) {
            console.log('Found Exercise: ', docFetched[i].exercise)
            const icon_to_put = exercises_icons.find(item => item.exercise === docFetched[i].exercise)?.icon;
            const viewToPush =  (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Image
                source={icon_to_put}
                style={{width: 20, height: 20}}
              />
              <Text style={{ fontSize: 8 }}>{docFetched[i].weight}*{docFetched[i].reps}</Text>
            </View>
            )
            viewsReturning.push(viewToPush);
        };
      }

      return viewsReturning;

    };


    let numRows;
    if (lastDateOfMonth + dayOneOfMonth <= 7*5) {
      numRows = 5; 
    } else {
      numRows = 6; 
    }

    const numCols = 7;
    const cellHeight = (calendarViewHeight-20) / numRows; // -20 include sun-sat header

    const days: React.ReactElement<ViewProps>[] = [];

    for (let i = 0; i < (numCols*numRows); i++) {
      if (i < dayOneOfMonth) {  // push last month's reamaining days
        const dayToPush = lastDateOfLastMonth - dayOneOfMonth + i + 1;
        days.push(
          <TouchableOpacity onPress={() => handleClickDay(state-1, dayToPush)} key={`month-${state-1}-cell-${dayToPush}`} >
            <View style={{...styles.cell, height: cellHeight}}>
              <Text style={{color: '#b4c94b', textAlign: 'center'}} >
                {dayToPush}
              </Text>
              {checkSavedWorkouts(dayToPush, -1)}
            </View>
          </TouchableOpacity>);
      } else if (i <= lastDateOfMonth + dayOneOfMonth - 1) {  // push this month's day
        const dayToPush = i - dayOneOfMonth + 1;
        if (state === 0 && dayToPush === currentDate.getDate()) { // if it's today
          days.push(
            <TouchableOpacity onPress={() => handleClickDay(state, dayToPush)} key={`month-${state}-cell-${dayToPush}`} id={`month-${state}-cell-${dayToPush}`}>
              <View  style={{...styles.cell, height: cellHeight}} >
                <Text style={{color: '#0ff726', textAlign: 'center'}}>
                  {dayToPush}
                </Text>
                {checkSavedWorkouts(dayToPush, 0)}
              </View>
            </TouchableOpacity>
          );
        } else {
          days.push(  // other day in same month
            <TouchableOpacity onPress={() => handleClickDay(state, dayToPush)} key={`month-${state+1}-cell-${dayToPush}`} id={`month-${state}-cell-${dayToPush}`}>
              <View style={{...styles.cell, height: cellHeight}}>
                <Text style={{color: '#2fbff7', textAlign: 'center'}}>
                  {dayToPush}
                </Text>
                {checkSavedWorkouts(dayToPush, 0)}
              </View>
            </TouchableOpacity>);
        }

      } else {  // push next month's starting days
        const dayToPush = i - lastDateOfMonth - dayOneOfMonth + 1;
        days.push(
          <TouchableOpacity onPress={() => handleClickDay(state+1, dayToPush)} key={`month-${state}-cell-${dayToPush}`} id={`month-${state}-cell-${dayToPush}`}>
            <View key={`month-${state+1}-cell-${dayToPush}`} style={{...styles.cell, height: cellHeight}}>
              <Text style={{color: '#b4c94b', textAlign: 'center'}}>
                {dayToPush}
              </Text>
              {checkSavedWorkouts(dayToPush, 1)}
            </View>
          </TouchableOpacity>);
      }
    }

    const rows: React.ReactElement<ViewProps>[] = [];
    rows[0] = (<View style={{flexDirection: 'row'}} key={`month-${state}-head`}>
      <Text key={`month-${state}-sunday`} style={{...styles.calendarHead}}>Sun</Text>
      <Text key={`month-${state}-monday`} style={{...styles.calendarHead}}>Mon</Text>
      <Text key={`month-${state}-tueday`} style={{...styles.calendarHead}}>Tue</Text>
      <Text key={`month-${state}-wednesday`} style={{...styles.calendarHead}}>Wed</Text>
      <Text key={`month-${state}-thursday`} style={{...styles.calendarHead}}>Thu</Text>
      <Text key={`month-${state}-friday`} style={{...styles.calendarHead}}>Fri</Text>
      <Text key={`month-${state}-saturday`} style={{...styles.calendarHead}}>Sat</Text>
    </View>)
    for (let i = 0; i < numRows; i++) {
      const comingWeekToRender = days.slice(0, numCols);
      days.splice(0, numCols);
      rows.push(
        <View key={`month-${state}-row-${i}`} style={styles.row}>
          {comingWeekToRender.map((item, index) => (
            item
          ))}
        </View>
      );
    }
    return rows;
  }
  
  useEffect(() => { 
    const changeNavigationHeader = (isRendered: boolean): void => {
      let showingMonthIndex = (currentMonth + currentIndex - monthsInitBeforeCurrent) % 12;
      if (showingMonthIndex < 0) {
        showingMonthIndex = 12 + showingMonthIndex; 
      } 

      const months: string[] = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      const showingMonth_str = months[(showingMonthIndex) % 12].toString();
      let addingYear;
      if (isRendered) {
        addingYear = Math.floor((currentMonth + currentIndex - monthsInitBeforeCurrent) / 12);
      } else {
        addingYear = 0;
      }
      const showingYear_str = (currentYear + addingYear).toString();
      navigation.setOptions({ title: showingMonth_str + ' ' + showingYear_str });
    };

    if (pageRendered.current) {
      console.log('currentIndex: ', currentIndex);
      changeNavigationHeader(true);

    } else {  // first render
      if (process.env.USERNAME) {
        const readingDoc = FIREBASE_READ_USER_DOC(process.env.USERNAME).then((querySnapshot) => {
          const readDoc: any[] = [];
          querySnapshot.forEach((doc) => {
              readDoc.push(doc.data());
          });
          // console.log('readDoc: ', readDoc)
          return readDoc;
        })
        .catch((error) => {
            console.error("Error fetching documents:", error);
            throw error; // Re-throw the error to propagate it to the caller
        });
  
        readingDoc.then((readDoc) => {
          for (let i=0; i<(monthsInitBeforeCurrent + 13); i++) {
            // first loop: state = 0-monthsInitBeforeCurrent 
            setAddedMonths(prevAddedMonths => [...prevAddedMonths, renderCalendar(i-monthsInitBeforeCurrent, readDoc)]);
          }
          changeNavigationHeader(false);
          pageRendered.current = true;
  
          setCurrentIndex(monthsInitBeforeCurrent);
        });
      }
 


    }

    return (()=>{});
  }, [currentIndex])

  const handleIndexChanged = (index: number) => {
    setCurrentIndex(index);
    setPageState(index-monthsInitBeforeCurrent)
  };
  
  const handleClickDay = (state: number, daySelected: number) => {
    setModalVisible(prev => !prev);
    console.log('state: ', state);
    setState(state);
    console.log('daySelected: ', daySelected);
    setDaySelected(daySelected);
  }

  const handleCloseModal = () => {
    setModalVisible(prev => !prev);

    interface toInput {
      exercise: string,
      weight: number,
      reps: number
    }
    const toInput: toInput[] = [];
    for (let i=0; i<sets_Exercise.length; i++) {  // loop to store exercise, weight, and set to toInput
      for (let j=0; j<sets_Exercise[i].length; j++) { // weight may = 0 but set > 0
        if (sets_Exercise[i][j] !== 0 && exercises_selected.includes(all_exercises[i].exercises[j])) {
          toInput.push({
            exercise: all_exercises[i].exercises[j],
            weight: weight_Exercise[i][j],
            reps: sets_Exercise[i][j]
          });
        };
      };
    };
    
    const yearSelected = () => {
      const lastYearDec_state = - currentMonth - 1; // -5 (May 2024), -17, -29 ...
      const nextYearJan_state = 12 - currentMonth;  // 8 (May 2024), 20, 32 ...
      let year;
      if (state <= lastYearDec_state) {
        year = currentYear + Math.floor((state - lastYearDec_state - 1)/12);  //  TOFIX
      } else if (state >= nextYearJan_state) {
        year = currentYear + Math.ceil((state - nextYearJan_state + 1)/12);  //  TODO: (Optional) not append more than one year now
      } else {
        year = currentYear;
      }
      return year;
    }
    const monthSelected = () => {
      let month = (currentMonth + state) % 12;
      if (month < 0) {
        month = 12 + month; 
      } 
      return month;
    }
    
    console.log('Total selected exercises: ', exercises_selected);
    console.log('state when closing: ', state);
    console.log('Chosen year: ', yearSelected());
    console.log('Chosen month: ', monthSelected());
    console.log('daySelected when closing: ', daySelected);
    console.log('toInput: ', toInput);

    for (let i=0; i<toInput.length; i++) {
      if (process.env.USERNAME) {
        FIREBASE_WRITE_TO_USER_DOC(process.env.USERNAME, toInput[i].exercise, toInput[i].weight, toInput[i].reps, yearSelected(), monthSelected(), daySelected);
      };
    };
    

    const updatedMonths = [...addedMonths];
    //for (let i=0; i<updatedMonths[currentIndex].length; i++) {  // for loop row number times
    const weekJSX: any = updatedMonths[currentIndex][1];
    const weekJSX_arr = React.Children.toArray(weekJSX.props.children);

    let isFoundDateSelected = false;  
    let isFoundFake_addNextMonth = false;

    if (weekJSX_arr.length > 0 && React.isValidElement(weekJSX_arr[0])) {
      setAddedMonths(prevAddedMonth => 
        prevAddedMonth.map((month, idx) => 
          idx === currentIndex 
          ? month.map((week: any, jdx) => {
            if (jdx !== 0 && !isFoundDateSelected) {  // from 1 (0 is sun-sat header)(through a column)
              for (let i=0; i<=6; i++) {  // loop from sunday to monday of a week (through a row)
                // console.log('week.props.childre[0].props.children: ', week.props.children[0].props.children);
                // const addToMonth = currentIndex - state;  // 60 = this month, 59 = last month... (may last or next month)

                let sunday_woTouchableOpacity = week.props.children[i].props.children;
                if (!React.isValidElement(sunday_woTouchableOpacity)) {
                  sunday_woTouchableOpacity = sunday_woTouchableOpacity[0];
                }
                console.log('sunday_woTouchableOpacity: ', sunday_woTouchableOpacity);  // week.props.children[0] == sunday of the week
                // console.log('sunday_woTouchableOpacity.props.children: ', sunday_woTouchableOpacity.props.children);
                let sundayChild = sunday_woTouchableOpacity.props.children;
                const sundayChild_arr = React.Children.toArray(sundayChild);
                let daySpecifying;
                if (sundayChild_arr.length != 1) {
                  sundayChild = sundayChild_arr[0];
                  console.log('sundayChild: ', sundayChild)
                  console.log('sundayChild.props.style.color: ', sundayChild.props.style.color);
                  daySpecifying = sundayChild.props.children;
                  console.log('daySpecifying: ', daySpecifying);
                  console.log('sundayChild.props: ', sundayChild.props);
                } else {
                  console.log('sundayChild: ', sundayChild[0])
                  console.log('sundayChild.props.style.color: ', sundayChild[0].props.style.color);
                  daySpecifying = sundayChild[0].props.children;
                  console.log('daySpecifying: ', daySpecifying);
                  console.log('sundayChild.props: ', sundayChild[0].props);
                }

                const appendExercise = () => {
                  const sundayChild_arr = React.Children.toArray(sunday_woTouchableOpacity.props.children);
                  // const sundayChild_arr = sunday_woTouchableOpacity.map((sunday: any) => {
                  //   return React.Children.toArray(sunday.props.children);
                  // });
                  console.log('sundayChild_arr: ', sundayChild_arr);
                  // console.log('typeof sundayChild_arr: ', typeof sundayChild_arr);
                  const sunday_clone_woTouchableOpacity = React.cloneElement(sunday_woTouchableOpacity, {children: [...sundayChild_arr, 
                    <View>
                      {all_exercises.map((part, idx) => { 
                        return part.exercises.map((exercise, jdx) => {  // exercise = loop through all exercise in all_exercise
                          for (let i=0; i<toInput.length; i++) {  // if any toInput == any in all exercise
                            if (exercise === toInput[i].exercise) {
                              const icon_to_put = exercises_icons.find(item => item.exercise === exercise)?.icon;
                              return (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Image
                                    source={icon_to_put}
                                    style={{width: 20, height: 20}}
                                  />
                                  <Text style={{ fontSize: 8 }}>{toInput[i].weight}*{toInput[i].reps}</Text>
                                </View>
                              )
                            }
                          }
                        })
                      })}
                    </View>
                  ]});
                  // console.log('sunday_clone_woTouchableOpacity: ', sunday_clone_woTouchableOpacity)
                  const sunday_original = week.props.children[i];
                  // console.log('sunday_original: ', sunday_original);
                  const sunday_original_children_arr = React.Children.toArray(sunday_original.props.children);
                  // console.log('sunday_original_children_arr: ', sunday_original_children_arr);
                  const sunday_modified_children_arr = sunday_original_children_arr;
                  sunday_modified_children_arr[0] = sunday_clone_woTouchableOpacity;
                  const sunday_clone = React.cloneElement(sunday_original, {children: sunday_modified_children_arr});
                  // console.log('sunday_clone: ', sunday_clone);
                  const week_original_child_arr = React.Children.toArray(week.props.children);
                  week_original_child_arr[i] = sunday_clone;
                  const week_clone = React.cloneElement(week, {children: week_original_child_arr});
                  console.log('week_clone.props.children: ', week_clone.props.children);
                  console.log('week_clone.props.children[0]: ', week_clone.props.children[0]);
                  isFoundDateSelected = true;
                  return week_clone;
                };

                if (daySpecifying === daySelected && pageState === state) { // add in current month
                  console.log('Adding record locally (current month)...');
                  if (daySpecifying >= 22) {
                    if (jdx > 1) {
                      return appendExercise();
                    }
                  } else {
                    return appendExercise();
                  }
                } else if (daySpecifying === daySelected && pageState < state) {  // add in next month
                  console.log('Adding record locally (next month)...');
                  if (isFoundFake_addNextMonth) {
                    return appendExercise();
                  }
                  isFoundFake_addNextMonth = true;
  
                } else if (daySpecifying === daySelected && pageState > state) {  // add in prev month
                  console.log('Adding record locally (prev month)...');
                  return appendExercise();
                }
              }
              return week;
            } else {
              return week;
            }
          })
          : month
        )
      )
    } 

    setIsChosenExercise(initFalseArray(all_exercises)); // set back to chosen nothing
    setWeight_Exercise(initZeroArray(all_exercises)); // set back to chosen nothing
    setSets_Exercise(initZeroArray(all_exercises)); // set back to chosen nothing
    setExercises_selected([]);  // set back to chosen nothing
  }

  const checkedItems = (exercise: string, idx:number, jdx:number, isChecked?: boolean, part?: string, weight?: string, sets?: string) => {
    console.log('CheckedItems...')
    console.log('exercise: ', exercise);
    if (isChecked) {
      console.log('isChecked: ', isChecked);
    }
    if (part) {
      console.log('part: ', part);
    }
    if (weight) {
      console.log('weight: ', weight);
    }
    if (sets) {
      console.log('set: ', sets)
    }
    if (idx !== undefined) {
      console.log('idx: ', idx);
    }
    if (jdx !== undefined) {
      console.log('jdx: ', jdx);
    }


    if (exercises_selected.includes(exercise) && isChecked === false) { // remove exercise
      setExercises_selected(prev => prev.filter(item => item !== exercise));
      console.log('Removed ', exercise);
      let cloneIsChosenExercise = isChosenExercise;
      cloneIsChosenExercise[idx][jdx] = false;
      setIsChosenExercise(cloneIsChosenExercise);
    } else if (isChecked === true) {  // add exercise
      setExercises_selected(prev => [...prev, exercise]);
      console.log('Added ', exercise);
      let cloneIsChosenExercise = isChosenExercise;
      cloneIsChosenExercise[idx][jdx] = true;
      setIsChosenExercise(cloneIsChosenExercise);
    } else if (!sets && weight !== undefined) { // inputing weight
      console.log('Setting weights');
      if (weight.includes('.')) {
        const weight_num = parseFloat(weight);  // string to float
        let newWeight_Exercise = weight_Exercise;
        newWeight_Exercise[idx][jdx] = weight_num;
        setWeight_Exercise(newWeight_Exercise);
      } else {
        const weight_num = parseInt(weight, 10);  // string to number (base 10)
        let newWeight_Exercise = weight_Exercise;
        newWeight_Exercise[idx][jdx] = weight_num;
        setWeight_Exercise(newWeight_Exercise);
      }
      
    } else if (!weight && sets !== undefined) {
      console.log('Setting sets');
      if (sets.includes('.')) {
        const sets_num = parseFloat(sets);  // string to float
        let newSets_Exercise = sets_Exercise;
        newSets_Exercise[idx][jdx] = sets_num;
        setSets_Exercise(newSets_Exercise);
      } else {
        const sets_num = parseInt(sets, 10);  // string to number (base 10)
        let newSets_Exercise = sets_Exercise;
        newSets_Exercise[idx][jdx] = sets_num;
        setSets_Exercise(newSets_Exercise);
      }

    } 
  }

  return (
    <View style={{height: height - headerHeight}}>
      {!pageRendered.current && (
        <View>
          <Text>Loading... Please wait...</Text>
        </View>
      )}
      {pageRendered.current && (
        <Swiper
        index={currentIndex}
        loop={false}
        onIndexChanged={handleIndexChanged}
        showsPagination={false}
        >
        {addedMonths.map((el, idx) => 
            <View key={idx} style={styles.container}>{el}</View>
        )}

      </Swiper>
      )}
      
      <Modal
          animationType="fade" // You can change the animation type as needed
          transparent={true} // Makes the modal background transparent
          visible={modalVisible} // Controls whether the modal is visible or not
          style={styles.modal}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
              {all_exercises.map((part, idx) => {
                return (
                  <View key={`body-part-${idx}`} style={{padding: 10}}>
                    <View style={{flexDirection: 'row'}}>
                      <View>
                        <Text style={styles.bodyPart_text}>{part.part}:</Text>
                      </View>
                      <View style={styles.weight_view}>
                        <Text style={styles.weight_text}>Weight</Text>
                      </View>
                      <View>  
                        <Text style={styles.sets_text}>Reps</Text>
                      </View>
                    </View>
                    <View>
                      {part.exercises.map((exercise, jdx) => {
                        return (
                          <View style={styles.viewPerExercise}>
                            <BouncyCheckbox
                              key={jdx}
                              fillColor='blue'
                              textStyle={{
                                color: 'black',
                                textDecorationLine: "none",
                              }}
                              text={exercise}
                              innerIconStyle={{ borderWidth: 2 }}
                              onPress={(isChecked: boolean) => {checkedItems(exercise, idx, jdx, isChecked, part.part)}}
                              style={styles.checkBox}
                            />
                            <TextInput
                              style={isChosenExercise[idx][jdx] ? styles.inputWeight : [styles.inputWeight, {backgroundColor: '#a1a1a1', borderWidth: 0}]}
                              keyboardType="numeric"
                              onChangeText={(weight) => checkedItems(exercise, idx, jdx, undefined, undefined, weight)}
                              editable={isChosenExercise[idx][jdx]}
                            />
                            <TextInput
                              style={isChosenExercise[idx][jdx] ? styles.inputSets : [styles.inputSets, {backgroundColor: '#a1a1a1', borderWidth: 0}]}
                              keyboardType="numeric"
                              onChangeText={(sets) => checkedItems(exercise, idx, jdx, undefined, undefined, undefined, sets)}
                              editable={isChosenExercise[idx][jdx]}
                            />
                          </View>
                        )
                      })}
                    </View>
                  </View>
                  )
                })
              }
              </ScrollView>
              <Button title="Close" onPress={handleCloseModal} />
            </View>
            
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
)}

const inputFieldWidth = (Dimensions.get('window').width)/8;
const marginBetweenWeight_Sets = (Dimensions.get('window').width)/60;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    backgroundColor: '#fcfcfc',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0, // Adjust the spacing between rows as needed
  },
  cell: {
    width: (Dimensions.get('window').width)/7, 
    //height: (windowDimensions.height)/5, 
    backgroundColor: '#fcfcfc',
    marginHorizontal: 0, // Adjust the spacing between cells as needed
    borderWidth: 1,
    borderColor: 'black',
  },
  calendarHead: {
    width: (Dimensions.get('window').width)/7, // Adjust the cell width as needed
    height: 20,
    backgroundColor: 'lightblue',
    marginHorizontal: 0, // Adjust the spacing between cells as needed
    borderWidth: 1,
    borderColor: 'black',
    textAlign: 'center',
  },
  modal: {
    //height: (Dimensions.get('window').height)/3
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    //height: (Dimensions.get('window').height)/3
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    height: (Dimensions.get('window').height)/2
  },
  viewPerExercise: {
    flexDirection: 'row',
    marginTop: (Dimensions.get('window').height)/200,
    marginBottom: (Dimensions.get('window').height)/200
  },
  checkBox: {
    padding: 2,
    width: (Dimensions.get('window').width)/2
  },
  bodyPart_text: {
    fontSize: 20, 
    width: (Dimensions.get('window').width)/2
  },
  weight_view: {
    width: inputFieldWidth,
    marginRight: marginBetweenWeight_Sets,
  },
  weight_text: {
    width: inputFieldWidth,
    marginRight: marginBetweenWeight_Sets,
    fontSize: 10,
    position: 'absolute',
    bottom: 0
  },
  sets_view: {
    width: inputFieldWidth,
  },
  sets_text: {
    width: inputFieldWidth,
    fontSize: 10,
    position: 'absolute',
    bottom: 0
  },
  inputWeight: {
    width: inputFieldWidth,
    borderWidth: 1, 
    marginRight: marginBetweenWeight_Sets
  },
  inputSets: {
    width: inputFieldWidth,
    borderWidth: 1, 
  }
});

export default HomeScreen;