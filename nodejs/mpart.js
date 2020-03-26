var M = {
  v: "v",
  f: function() {
    console.log(this.v);
  }
};

// M.f(); 이 동작을 다른데서 사용할 수 있다.
module.exports = M;
