uniform vec3 color;
uniform vec3 uLightDirection;
uniform vec3 uAmbientLightColor;
uniform vec3 uMetalness;

varying vec3 vNormal;

void main() {
  vec3 norm = normalize(vNormal);
  float nDotL = clamp(dot(uLightDirection, norm), 0.0, 1.0);

  // Specular light component
  vec3 halfDir = normalize(vec3(0.0, 0.0, 1.0)); // Simplified half-vector
  float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0);
  vec3 specular = spec * mix(vec3(1.0), vec3(1.0, 1.0, 1.0), 0.);

  vec3 diffuseColor = nDotL * color;
  gl_FragColor = vec4(diffuseColor * 1. + uAmbientLightColor * 0.2 + specular, 1.);
}