import React from 'react';
import {Image, View} from 'react-native';
import asset from '../public/orbit-study-mascot.png';
// Preview substitution for the advertisement, not a deployed application change.
export function Bot({size=56,style}: {size?:number;style?:any;state?:string;active?:boolean;watchingInput?:boolean}) {
 return <View style={[{width:size,height:size},style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Image source={{uri:asset}} style={{width:size,height:size}} resizeMode="contain"/></View>;
}
