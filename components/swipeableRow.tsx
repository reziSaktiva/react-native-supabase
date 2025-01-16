import { Todo } from "@/powersync/drizzle/AppSchema";
import React, { Component, PropsWithChildren } from "react";
import { Animated, I18nManager, StyleSheet, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export default class AppleStyleSwipeableRow extends Component<
  PropsWithChildren<Props>
> {
  private renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      if (text === "Done" || text === "Undone") {
        this.props.onToggle();
      } else if (text === "Delete") {
        this.props.onDelete();
      }

      this.close();
    };

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Animated.Text style={styles.actionText}>{text}</Animated.Text>
        </RectButton>
      </Animated.View>
    );
  };

  private renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => (
    <View
      style={{
        width: 160,
        flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
      }}
    >
      {this.props.todo.is_complete === 0 &&
        this.renderRightAction("Done", "#00d890", 160, progress)}
      {this.props.todo.is_complete === 1 &&
        this.renderRightAction("Undone", "#ffab00", 160, progress)}
      {this.renderRightAction("Delete", "red", 160, progress)}
    </View>
  );

  private swipeableRow?: Swipeable;

  private updateRef = (ref: Swipeable) => {
    this.swipeableRow = ref;
  };
  private close = () => {
    this.swipeableRow?.close();
  };

  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={this.renderRightActions}
      >
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  actionText: {
    color: "white",
    backgroundColor: "transparent",
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
  },
});
