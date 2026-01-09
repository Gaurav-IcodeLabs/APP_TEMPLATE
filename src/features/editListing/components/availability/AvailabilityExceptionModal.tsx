import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { SimpleSelect } from '@components/index';
import { AvailabilityException } from '../../types/editListingForm.type';

interface AvailabilityExceptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exception: AvailabilityException) => void;
}

// Generate time options (same as TimeSlotEntry)
const generateTimeOptions = () => {
  const times: { label: string; value: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const value = `${hourStr}:00`;
    const label = formatTimeDisplay(value);
    times.push({ label, value });
  }
  return times;
};

const formatTimeDisplay = (time: string): string => {
  if (!time) return '';
  const [hourStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const TIME_OPTIONS = generateTimeOptions();

export const AvailabilityExceptionModal: React.FC<AvailabilityExceptionModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('00:00');
  const [seats, setSeats] = useState('0');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setStartDate('');
      setStartTime('00:00');
      setEndDate('');
      setEndTime('00:00');
      setSeats('0');
    }
  }, [visible]);

  // Filter end time options based on start time when dates are the same
  const getEndTimeOptions = () => {
    // If dates are different, show all times
    if (!startDate || !endDate || startDate !== endDate) {
      return TIME_OPTIONS;
    }
    
    // If dates are the same, only show times after start time
    if (!startTime) {
      return TIME_OPTIONS;
    }
    
    const startIndex = TIME_OPTIONS.findIndex(opt => opt.value === startTime);
    return TIME_OPTIONS.slice(startIndex + 1);
  };

  const endTimeOptions = getEndTimeOptions();

  // Clear end time if it becomes invalid when start time or dates change
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    // If dates are the same and end time is now invalid, clear it
    if (startDate && endDate && startDate === endDate) {
      if (endTime && endTime <= newStartTime) {
        setEndTime('');
      }
    }
  };

  const handleStartDateChange = (dateString: string) => {
    setStartDate(dateString);
    
    // If end date is before new start date, clear it
    if (endDate && dateString > endDate) {
      setEndDate('');
      setEndTime('');
    }
    
    // If dates become the same, validate end time
    if (endDate && dateString === endDate && endTime && endTime <= startTime) {
      setEndTime('');
    }
  };

  const handleEndDateChange = (dateString: string) => {
    setEndDate(dateString);
    
    // If dates become the same, validate end time
    if (startDate && dateString === startDate && endTime && endTime <= startTime) {
      setEndTime('');
    }
  };

  const handleSave = () => {
    if (!startDate || !endDate) {
      Alert.alert('Validation Error', 'Please select both start and end dates');
      return;
    }

    // Create ISO date strings
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      Alert.alert('Validation Error', 'End date/time must be after start date/time');
      return;
    }

    const exception: AvailabilityException = {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      seats: parseInt(seats, 10) || 0,
    };

    onSave(exception);
    onClose();
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add an availability exception</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
        >
          {/* Start Date and Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Starts</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartCalendar(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {formatDateDisplay(startDate)}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.timeSelect}>
                <SimpleSelect
                  value={startTime}
                  onChange={handleStartTimeChange}
                  options={TIME_OPTIONS}
                  placeholder="Time"
                />
              </View>
            </View>
          </View>

          {/* End Date and Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Ends</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity 
                style={[styles.dateButton, !startDate && styles.disabledButton]}
                onPress={() => startDate && setShowEndCalendar(true)}
                disabled={!startDate}
              >
                <Text style={[styles.dateButtonText, !startDate && styles.disabledText]}>
                  📅 {formatDateDisplay(endDate)}
                </Text>
              </TouchableOpacity>
              
              <View style={[styles.timeSelect, !startDate && styles.disabledSelect]}>
                <SimpleSelect
                  value={endTime}
                  onChange={setEndTime}
                  options={endTimeOptions}
                  placeholder="Time"
                  disabled={!startDate}
                />
              </View>
            </View>
          </View>

          {/* Seats */}
          <View style={styles.section}>
            <Text style={styles.label}>Seats</Text>
            <TextInput
              style={styles.seatsInput}
              value={seats}
              onChangeText={setSeats}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save exception</Text>
          </TouchableOpacity>
        </View>

        {/* Start Date Calendar Modal */}
        <Modal
          visible={showStartCalendar}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStartCalendar(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartCalendar(false)}>
                  <Text style={styles.calendarClose}>Done</Text>
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={(day) => {
                  handleStartDateChange(day.dateString);
                  setShowStartCalendar(false);
                }}
                markedDates={{
                  [startDate]: {
                    selected: true,
                    selectedColor: '#4A90E2',
                  },
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#4A90E2',
                  selectedDayBackgroundColor: '#4A90E2',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#4A90E2',
                }}
              />
            </View>
          </View>
        </Modal>

        {/* End Date Calendar Modal */}
        <Modal
          visible={showEndCalendar}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEndCalendar(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select End Date</Text>
                <TouchableOpacity onPress={() => setShowEndCalendar(false)}>
                  <Text style={styles.calendarClose}>Done</Text>
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={(day) => {
                  handleEndDateChange(day.dateString);
                  setShowEndCalendar(false);
                }}
                markedDates={{
                  [endDate]: {
                    selected: true,
                    selectedColor: '#4A90E2',
                  },
                }}
                minDate={startDate || new Date().toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#4A90E2',
                  selectedDayBackgroundColor: '#4A90E2',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#4A90E2',
                }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  disabledText: {
    color: '#999',
  },
  disabledSelect: {
    opacity: 0.5,
  },
  timeSelect: {
    flex: 1,
  },
  seatsInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    paddingVertical: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});
