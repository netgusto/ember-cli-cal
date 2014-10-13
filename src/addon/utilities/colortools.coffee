### jslint node:true ###
# Taken from http://stackoverflow.com/a/13542669

"use strict"

shadeColor2 = (color, percent) ->
    f = parseInt(color.slice(1), 16)
    t = (if percent < 0 then 0 else 255)
    p = (if percent < 0 then percent * -1 else percent)
    R = f >> 16
    G = f >> 8 & 0x00ff
    B = f & 0x0000ff
    "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)

blendColors = (c0, c1, p) ->
    f = parseInt(c0.slice(1), 16)
    t = parseInt(c1.slice(1), 16)
    R1 = f >> 16
    G1 = f >> 8 & 0x00ff
    B1 = f & 0x0000ff
    R2 = t >> 16
    G2 = t >> 8 & 0x00ff
    B2 = t & 0x0000ff
    "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1)

lib =
    shadeColor: shadeColor2
    blendColors: blendColors

`export default lib`