import React, {
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Deferred from 'es6-deferred';
import {Dialog, Button, Portal} from 'react-native-paper';
const context = createContext({});
const {Provider} = context;
const DateTimePickerProvider = ({children}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolve, setResolve] = useState(null);
  const [reject, setReject] = useState(null);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('datetime');
  const resolveRef = useRef();
  resolveRef.current = resolve;
  const value = useMemo(
    () => ({
      setResolve,
      setIsOpen,
      setDate,
      setMode,
      setReject,
    }),
    [],
  );
  return [
    <Portal>
      <Dialog
        visible={isOpen}
        onDismiss={() => {
          reject && reject();
          setResolve(null);
          setReject(null);
          setIsOpen(false);
        }}>
        <Dialog.Title>Pick a Time </Dialog.Title>
        <Dialog.Content>
          <RNDateTimePicker
            mode={mode}
            display="spinner"
            value={date}
            minuteInterval={1}
            minimumDate={Date.now()}
            onChange={(_, selectedDate) => {
              setDate(selectedDate);
            }}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              reject();
              setIsOpen(false);
              setResolve(null);
              setReject(null);
            }}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              resolve(date);
            }}>
            Accept
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>,
    <Provider value={value}>{children}</Provider>,
  ];
};
const useDateTimePicker = () => {
  const value = useContext(context);
  return useCallback(
    async (mode = 'datetime', startDate = new Date()) => {
      const {setIsOpen, setResolve, setDate, setMode, setReject} = value;
      const {promise, resolve, reject} = new Deferred();
      setResolve(() => resolve);
      setReject(() => reject);
      setIsOpen(true);
      setDate(startDate);
      setMode(mode);
      const out = await promise;
      setIsOpen(false);
      setResolve(null);
      setDate(new Date());
      return out;
    },
    [value],
  );
};
export default DateTimePickerProvider;
export {useDateTimePicker};
