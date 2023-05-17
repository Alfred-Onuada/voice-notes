import { Dispatch, SetStateAction, useState } from "react";
import { View, StyleSheet, Button, Text } from "react-native";
import { Audio } from 'expo-av';
import { Recording } from "expo-av/build/Audio";

export default function Home() {
  const [recordedUri, setRecordedUri]: [recordedUri: string | undefined, setRecordedUri: Dispatch<SetStateAction<string | undefined>>] = useState();
  const [recording, setRecording]: [recording: Recording | undefined, setRecording: Dispatch<SetStateAction<Recording | undefined>>] = useState();
  const [transcription, setTranscription] = useState('');
  const sound = new Audio.Sound();
  
  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');

    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording?.getURI();

    if (uri) {
      setRecordedUri(uri)
      console.log('Recording stopped and stored at', uri);
    }
  }

  async function playRecording() {
    console.log('Loading Sound');

    if (recordedUri) {
      // trying to load it twice will throw an error
      if (sound) {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }

      await sound.loadAsync({
        uri: recordedUri
      })

      console.log('Playing Sound');
      await sound.playAsync();
    } else {
      console.log('Audio has not been recorded yet')
    }
  }

  async function transcribeAudio() {
    if (recordedUri) {
      const filetype = recordedUri.split(".").pop();
      const filename = recordedUri.split("/").pop();

      const formData = new FormData()
      formData.append('file', {
        uri: recordedUri,
        type: filetype,
        name: filename
      })
      formData.append('model', 'whisper-1')

      const resp = await fetch('http://192.168.43.188:3000/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      const data = await resp.json();

      setTranscription(data.text);
    } else {
      console.log('Nothing to transcribe')
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Record" onPress={startRecording}></Button>
      <Button title="Stop" onPress={stopRecording}></Button>
      <Button title="Playback" onPress={playRecording}></Button>
      <Button title="Transcribe" onPress={transcribeAudio}></Button>

      <Text>Below is the transcription of the recorded Audio</Text>
      <Text>{transcription}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})