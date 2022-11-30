uniform sampler2D uMaskTexture;
uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uRevealTexture;
uniform float uRevealProgress;

varying vec2 vUv;

float getPerlinProgress(vec2 uv, sampler2D _texture, float progress) {
    vec2 textureFrequency = vec2(1.0, 1.0);
    vec2 scaledUv = uv * textureFrequency;
    float perlinStrength = texture2D(_texture, scaledUv).r;

    float newProgress = perlinStrength - (0.5 - progress);

    newProgress = step(0.5, newProgress);
    newProgress = clamp(newProgress, 0.0, 1.0);

    return newProgress;
}

void main() {
    float revealPerlinProgress = getPerlinProgress(vUv, uRevealTexture, uRevealProgress);

    float mask = texture2D(uMaskTexture, vUv).r;
    mask = 1.0 - mask;

    gl_FragColor = vec4(uColor, mask * revealPerlinProgress);
}
