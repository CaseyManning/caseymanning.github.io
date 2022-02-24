varying vec3 v_pos;
  varying vec3 v_nrm;
  varying vec2 v_txc;

  void main(){
    v_pos = position;
    v_nrm = normal;
    v_txc = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }