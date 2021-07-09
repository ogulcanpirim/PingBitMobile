import { Text, View, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { scheduleReducer } from '../services';
import { getSchedules } from "../services";
import { Card } from 'react-native-elements';
import dayjs from "dayjs";


const timeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

const scheduleScreen = (props) => {

  //yukarı refresh veya her tab navigatorda refresh
  useEffect(() => {
    props.getSchedules();
  }, []);

  if (props.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={props.schedules}
        keyExtractor={(item, index) => index + ""}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <Card.Title style={{ color: 'white' }}>{item.title}</Card.Title>
            <Text style={{ color: 'white' }}>Kullanıcı: {item.user}</Text>
            <Text style={{ color: 'white' }}>Açıklama: {item.description}</Text>
            <Text style={{ color: 'white' }}>startDate: {new Date(item.startDate).toLocaleDateString('tr-TR', timeOptions)}</Text>
            <Text style={{ color: 'white' }}>endDate: {new Date(item.endDate).toLocaleDateString('tr-TR', timeOptions)}</Text>
            <Text style={{ color: 'white' }}>Görüşülecek Kullanıcı: {item.meetingUser}</Text>
            <Text style={{ color: 'white' }}></Text>
            <View styles={styles.buttons}>
              <TouchableOpacity style={styles.chatButton} onPress={() => props.navigation.navigate('Chat', { id: item.id })}>
                <Text style={{ color: 'white' }}>CHAT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoButton} onPress={() => props.navigation.navigate('VideoCall', { id: item.id })}>
                <Text style={{ color: 'white' }} >VIDEO CALL</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const mapStateToProps = (state) => ({
  scheduleReducer: state.scheduleReducer,
  schedules: state.scheduleReducer.schedules,
  loading: state.scheduleReducer.loading,
})

const ScheduleScreen = connect(mapStateToProps, { scheduleReducer, getSchedules })(scheduleScreen);

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    paddingTop: 22,
  },
  card: {
    backgroundColor: '#b3a7a6',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },

  chatButton: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'green',
  },

  videoButton: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'blue',
  },

});

export default ScheduleScreen;