import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
  View
} from 'react-native'
import { Constants } from 'expo'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'

import images from './imgs/images'

const AnimatedIcon = Animated.createAnimatedComponent(Icon)
const { width } = Dimensions.get('window')

export default class App extends React.Component {
  state = {
    activeImage: null,
    activeIndex: null,
    animation: new Animated.Value(0),
    position: new Animated.ValueXY(),
    size: new Animated.ValueXY()
  }

  componentWillMount() {
    this.gridImages = {}
  }

  handleOpenImage = index => {
    this.gridImages[index]
      .getNode()
      .measure((x, y, width, height, pageX, pageY) => {
        this.originX = pageX
        //for some reason the pageY take into account the status bar but the View container doesn't
        this.originY = pageY - Constants.statusBarHeight
        this.originWidth = width
        this.originHeight = height

        this.state.position.setValue({
          x: this.originX,
          y: this.originY
        })
        this.state.size.setValue({
          x: this.originWidth,
          y: this.originHeight
        })

        Animated.parallel([
          Animated.spring(this.state.position.x, {
            toValue: this.imageViewX
          }),
          Animated.spring(this.state.position.y, {
            toValue: this.imageViewY
          }),
          Animated.spring(this.state.size.x, {
            toValue: this.imageViewWidth
          }),
          Animated.spring(this.state.size.y, {
            toValue: this.imageViewHeight
          }),
          Animated.spring(this.state.animation, {
            toValue: 1
          })
        ]).start()
      })

    this.setState({ activeImage: images[index], activeIndex: index })
  }

  handleCloseImage = () => {
    Animated.parallel([
      Animated.spring(this.state.position.x, {
        toValue: this.originX
      }),
      Animated.spring(this.state.position.y, {
        toValue: this.originY
      }),
      Animated.spring(this.state.size.x, {
        toValue: this.originWidth
      }),
      Animated.spring(this.state.size.y, {
        toValue: this.originHeight
      }),
      Animated.spring(this.state.animation, {
        toValue: 0
      })
    ]).start(() => {
      this.setState({ activeImage: null, activeIndex: null })
    })
  }

  render() {
    const translateYInterpolate = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [150, 0]
    })

    const activeImageStyle = {
      left: this.state.position.x,
      top: this.state.position.y,
      width: this.state.size.x,
      height: this.state.size.y
    }

    const textWraperStyle = {
      transform: [
        {
          translateY: translateYInterpolate
        }
      ],
      opacity: this.state.animation
    }

    const closeIconStyle = {
      opacity: this.state.animation
    }

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageGrid}>
            {images.map((image, index) => (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => this.handleOpenImage(index)}
              >
                <Animated.Image
                  source={image}
                  style={styles.gridImage}
                  resizeMode="cover"
                  ref={image => (this.gridImages[index] = image)}
                />
              </TouchableWithoutFeedback>
            ))}
          </View>
        </ScrollView>

        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={this.state.activeImage ? 'auto' : 'none'}
        >
          <View
            style={styles.imageWraper}
            onLayout={e => {
              this.imageViewWidth = e.nativeEvent.layout.width
              this.imageViewHeight = e.nativeEvent.layout.height
              this.imageViewX = e.nativeEvent.layout.x
              this.imageViewY = e.nativeEvent.layout.y
            }}
          >
            <Animated.Image
              key={this.state.activeImage}
              source={this.state.activeImage}
              style={[styles.viewImage, activeImageStyle]}
              resizeMode="cover"
            />
            <TouchableWithoutFeedback onPress={this.handleCloseImage}>
              <AnimatedIcon
                name="window-close"
                size={30}
                color="#fff"
                style={[styles.closeIconStyle, closeIconStyle]}
              />
            </TouchableWithoutFeedback>
          </View>
          <Animated.View style={[styles.textWraper, textWraperStyle]}>
            <Text style={styles.title}>Pretty Image from Unsplash</Text>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              lobortis interdum porttitor. Nam lorem justo, aliquam id feugiat
              quis, malesuada sit amet massa. Sed fringilla lorem sit amet metus
              convallis, et vulputate mauris convallis. Donec venenatis
              tincidunt elit, sed molestie massa. Fusce scelerisque nulla vitae
              mollis lobortis. Ut bibendum risus ac rutrum lacinia. Proin vel
              viverra tellus, et venenatis massa. Maecenas ac gravida purus, in
              porttitor nulla. Integer vitae dui tincidunt, blandit felis eu,
              fermentum lorem. Mauris condimentum, lorem id convallis fringilla,
              purus orci viverra metus, eget finibus neque turpis sed turpis.
            </Text>
          </Animated.View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageGrid: {
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  gridImage: {
    width: Math.floor(width / 3),
    height: Math.floor(width / 3)
  },
  imageWraper: {
    flex: 1
  },
  viewImage: {
    position: 'absolute'
  },
  textWraper: {
    flex: 2,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    marginBottom: 10
  },
  closeIconStyle: {
    position: 'absolute',
    top: 10,
    right: 10
  }
})
