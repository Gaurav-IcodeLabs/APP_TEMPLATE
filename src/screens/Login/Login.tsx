import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useAppDispatch } from '@redux/store';
import { login } from '@redux/slices/auth.slice';

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();

  const loginUser = async () => {
    await dispatch(
      login({
        username: 'b@yopmail.com',
        password: '12345678',
      }),
    );
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Login</Text>

      <TouchableOpacity
        style={{
          width: 200,
          height: 50,
          backgroundColor: 'grey',
          marginTop: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => loginUser()}
      >
        <Text>login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});
