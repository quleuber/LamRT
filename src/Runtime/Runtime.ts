export type MAP<T> = Record<string, T>;

// Due to F64 limits, locations are 28 bits in JS and 40 bits in C
// NIL: {tag: U4}
// LAM: {tag: U4, pos: U28 | U40}
// APP: {tag: U4, pos: U28 | U40}
// PAR: {tag: U4, col: U20, pos: U28 | U40}
// DP0: {tag: U4, col: U20, pos: U28 | U40}
// DP1: {tag: U4, col: U20, pos: U28 | U40}
// VAR: {tag: U4, pos: U28 | U40}
// ARG: {tag: U4, pos: U28 | U40}
// CTR: {tag: U4, fun: U16, ari: U4, pos: U28 | U40}
// OP2: {tag: U4, ope: U4, pos: U28 | U40}
// U32: {tag: U4, val: U32}

export const NIL : number = 0
export const LAM : number = 1
export const APP : number = 2
export const PAR : number = 3
export const DP0 : number = 4
export const DP1 : number = 5
export const VAR : number = 6
export const ARG : number = 7
export const CTR : number = 8
export const CAL : number = 9
export const OP2 : number = 10
export const U32 : number = 11

export const ADD : number = 0
export const SUB : number = 1
export const MUL : number = 2
export const DIV : number = 3
export const MOD : number = 4
export const AND : number = 5
export const OR  : number = 6
export const XOR : number = 7
export const SHL : number = 8
export const SHR : number = 9
export const LTN : number = 10
export const LTE : number = 11
export const EQL : number = 12
export const GTE : number = 13
export const GTN : number = 14
export const NEQ : number = 15

//GENERATED_CONSTRUCTOR_IDS_START//
//GENERATED_CONSTRUCTOR_IDS//
//GENERATED_CONSTRUCTOR_IDS_END//

export type Lnk = number // U52 in JS, U64 in C

export type Arr = {size: number, data: Uint32Array};
export type Mem = {lnk: Arr, use: Array<Arr>};

// Uint64Array
// -----------

export function array_alloc(capacity: number) {
  return {
    size: 0,
    data: new Uint32Array(capacity * 2),
  }
}

export function array_write(arr: Arr, idx: number, val: number) {
  arr.data[idx * 2 + 1] = (val / 0x100000000) >>> 0;
  arr.data[idx * 2 + 0] = val >>> 0;
}

export function array_read(arr: Arr, idx: number) : number {
  return (arr.data[idx * 2 + 1] * 0x100000000) + arr.data[idx * 2 + 0];
}

export function array_push(arr: Arr, value: number) {
  array_write(arr, arr.size++, value);
}

export function array_pop(arr: Arr) : number | null {
  if (arr.size > 0) {
    return array_read(arr, --arr.size);
  } else {
    return null;
  }
}

// Memory
// ------

export var GAS : number = 0;
////export var MEM : Mem = null as unknown as Mem;

export function Nil() : Lnk {
  return NIL;
}

export function Lam(pos: number) : Lnk {
  return LAM + (pos * 0x1000000);
}

export function App(pos: number) : Lnk {
  return APP + (pos * 0x1000000);
}

export function Par(col: number, pos: number) : Lnk {
  return PAR + (col * 0x10) + (pos * 0x1000000);
}

export function Dp0(col: number, pos: number) : Lnk {
  return DP0 + (col * 0x10) + (pos * 0x1000000);
}

export function Dp1(col: number, pos: number) : Lnk {
  return DP1 + (col * 0x10) + (pos * 0x1000000);
}

export function Var(pos: number) : Lnk {
  return VAR + (pos * 0x1000000);
}

export function Arg(pos: number) : Lnk {
  return ARG + (pos * 0x1000000);
}

export function Ctr(fun: number, ari: number, pos: number) {
  return CTR + (fun * 0x10) + (ari * 0x100000) + (pos * 0x1000000);
}

export function Cal(fun: number, ari: number, pos: number) {
  return CAL + (fun * 0x10) + (ari * 0x100000) + (pos * 0x1000000);
}

export function Op2(ope: number, pos: number) : Lnk {
  return OP2 + (ope * 0x10) + (pos * 0x1000000);
}

export function U_32(val: number) : Lnk {
  return U32 + (val * 0x10);
}

export function get_tag(lnk: Lnk) : number {
  return lnk & 0xF;
}

export function get_col(lnk: Lnk) : number {
  return Math.floor(lnk / 0x10) & 0xFFFFF;
}

export function get_fun(lnk: Lnk) : number {
  return Math.floor(lnk / 0x10) & 0xFFFF;
}

export function get_ari(lnk: Lnk) : number {
  return Math.floor(lnk / 0x100000) & 0xF;
}

export function get_ope(lnk: Lnk) : number {
  return Math.floor(lnk / 0x10) & 0xF;
}

export function get_num(lnk: Lnk) : number {
  return Math.floor(lnk / 0x10) >>> 0;
}

export function get_loc(lnk: Lnk, arg: number) : number {
  return Math.floor(lnk / 0x1000000) + arg;
}

export function get_lnk(MEM: Mem, term: Lnk, arg: number) : Lnk {
  return array_read(MEM.lnk, get_loc(term,arg));
}

export function deref(MEM: Mem, loc: number) : Lnk {
  return array_read(MEM.lnk, loc);
}

export function link(MEM: Mem, loc: number, link: Lnk) : Lnk {
  array_write(MEM.lnk, loc, link);
  switch (get_tag(link)) {
    case VAR: array_write(MEM.lnk, get_loc(link,0), Arg(loc)); break;
    case DP0: array_write(MEM.lnk, get_loc(link,0), Arg(loc)); break;
    case DP1: array_write(MEM.lnk, get_loc(link,1), Arg(loc)); break;
  }
  return link;
}

export function get_gas() : number {
  return GAS;
}

export function alloc(MEM: Mem, size: number) : number {
  if (size === 0) {
    return 0;
  } else {
    var reuse = array_pop(MEM.use[size]);
    if (reuse !== null) {
      return reuse;
    } else {
      var loc = MEM.lnk.size;
      for (var i = 0; i < size; ++i) {
        array_push(MEM.lnk, 0);
      }
      return loc;
    }
  }
}

export function clear(MEM: Mem, loc: number, size: number) {
  if (size > 0) {
    // pushes to free list
    array_push(MEM.use[size], loc);
  }
}

// ~~~

export function init(capacity: number = 2 ** 28) {
  var MEM = {
    lnk: array_alloc(capacity),
    use: [
      array_alloc(0),
      array_alloc(2 ** 25),
      array_alloc(2 ** 25),
      array_alloc(2 ** 24),
      array_alloc(2 ** 24),
      array_alloc(2 ** 23),
      array_alloc(2 ** 23),
      array_alloc(2 ** 23),
      array_alloc(2 ** 23),
    ]
  }
  array_push(MEM.lnk, 0);
  return MEM;
}

// Garbage Collection
// ------------------

export function collect(MEM: Mem, term: Lnk) {
  switch (get_tag(term)) {
    case LAM: {
      if (get_tag(get_lnk(MEM,term,0)) !== NIL) {
        link(MEM, get_loc(get_lnk(MEM,term,0),0), Nil());
      }
      collect(MEM, get_lnk(MEM,term,1));
      clear(MEM, get_loc(term,0), 2);
      break;
    }
    case APP: {
      collect(MEM, get_lnk(MEM,term,0));
      collect(MEM, get_lnk(MEM,term,1));
      clear(MEM, get_loc(term,0), 2);
      break;
    }
    case PAR: {
      collect(MEM, get_lnk(MEM,term,0));
      collect(MEM, get_lnk(MEM,term,1));
      clear(MEM, get_loc(term,0), 2);
      break;
    }
    case DP0: {
      link(MEM, get_loc(term,0), Nil());
      //reduce(MEM, get_loc(get_lnk(MEM,term,1),0));
      break;
    }
    case DP1: {
      link(MEM, get_loc(term,1), Nil());
      //reduce(MEM, get_loc(get_lnk(MEM,term,0),0));
      break;
    }
    case CAL:
    case CTR: {
      var arity = get_ari(term);
      for (var i = 0; i < arity; ++i) {
        collect(MEM, get_lnk(MEM,term,i));
      }
      clear(MEM, get_loc(term,0), arity);
      break;
    }
    case OP2: {
      collect(MEM, get_lnk(MEM,term,0));
      collect(MEM, get_lnk(MEM,term,1));
      break;
    }
    case U32: {
      break;
    }
    case VAR: {
      link(MEM, get_loc(term,0), Nil());
      break;
    }
  }
}

// Reduction
// ---------

export function subst(MEM: Mem, lnk: Lnk, val: Lnk) {
  if (get_tag(lnk) !== NIL) {
    link(MEM, get_loc(lnk,0), val);
  } else {
    collect(MEM, val);
  }
}


export function reduce(MEM: Mem, host: number) : Lnk {
  while (true) {

    var term = deref(MEM, host);
    //console.log("reduce", debug_show(MEM,deref(MEM,0)));

    switch (get_tag(term)) {
      case APP: {
        let func = reduce(MEM, get_loc(term,0));
        switch (get_tag(func)) {
          // (λx:b a)
          // --------- APP-LAM
          // x <- a
          case LAM: {
            ++GAS;
            //console.log("[app-lam] " + get_loc(term,0) + " " + get_loc(func,0));
            subst(MEM, get_lnk(MEM, func, 0), get_lnk(MEM, term, 1));
            link(MEM, host, get_lnk(MEM, func, 1));
            clear(MEM, get_loc(term,0), 2);
            clear(MEM, get_loc(func,0), 2);
            //console.log(show_term(MEM, deref(MEM, 0)));
            continue;
          }
          // (&A<a b> c)
          // ----------------- APP-PAR
          // !A<x0 x1> = c
          // &A<(a x0) (b x1)>
          case PAR: {
            //console.log("[app-par] " + get_loc(term,0) + " " + get_loc(func,0));
            ++GAS;
            var app0 = get_loc(term, 0);
            var app1 = get_loc(func, 0);
            var let0 = alloc(MEM, 3);
            var par0 = alloc(MEM, 2);
            link(MEM, let0+2, get_lnk(MEM, term, 1));    // w: let0[2] r: app0[1]
            link(MEM, app0+1, Dp0(get_col(func), let0)); // w: app0[1] let0[0]
            link(MEM, app0+0, get_lnk(MEM, func, 0));    // w: app0[0] r: app1[0]
            link(MEM, app1+0, get_lnk(MEM, func, 1));    // w: app1[0] r: app1[1]
            link(MEM, app1+1, Dp1(get_col(func), let0)); // w: app1[1] let0[1]
            link(MEM, par0+0, App(app0));                // w: par0[0]
            link(MEM, par0+1, App(app1));                // w: par0[1]
            return link(MEM, host, Par(get_col(func), par0));
            //var let0 = alloc(MEM, 3);
            //var app0 = alloc(MEM, 2);
            //var app1 = alloc(MEM, 2);
            //var par0 = alloc(MEM, 2);
            //link(MEM, let0+2, get_lnk(MEM, term, 1));
            //link(MEM, app0+0, get_lnk(MEM, func, 0));
            //link(MEM, app0+1, lnk(DP0, get_ex0(func), 0, let0));
            //link(MEM, app1+0, get_lnk(MEM, func, 1));
            //link(MEM, app1+1, lnk(DP1, get_ex0(func), 0, let0));
            //link(MEM, par0+0, lnk(APP, 0, 0, app0));
            //link(MEM, par0+1, lnk(APP, 0, 0, app1));
            //link(MEM, host, lnk(PAR, get_ex0(func), 0, par0));
            //clear(MEM, get_loc(term,0), 2);
            //clear(MEM, get_loc(func,0), 2);
            //return deref(MEM, host);
          }
        }
        break;
      }
      case OP2: {
        var val0 = reduce(MEM, get_loc(term,0));
        var val1 = reduce(MEM, get_loc(term,1));
        // (+ a b)
        // --------- OP2-U32
        // add(a, b)
        if (get_tag(val0) === U32 && get_tag(val1) === U32) {
          var a = get_num(val0);
          var b = get_num(val1);
          var c : number;
          switch (get_ope(term)) {
            case ADD: c = (a + b) >>> 0; break;
            case SUB: c = (a - b) >>> 0; break;
            case MUL: c = (a * b) >>> 0; break;
            case DIV: c = (a / b) >>> 0; break;
            case MOD: c = (a % b) >>> 0; break;
            case AND: c = (a & b) >>> 0; break;
            case OR : c = (a | b) >>> 0; break;
            case XOR: c = (a ^ b) >>> 0; break;
            case SHL: c = (a << b) >>> 0; break;
            case SHR: c = (a >>> b) >>> 0; break;
            case LTN: c = (a < b) ? 1 : 0; break;
            case LTE: c = (a <= b) ? 1 : 0; break;
            case EQL: c = (a === b) ? 1 : 0; break;
            case GTE: c = (a >= b) ? 1 : 0; break;
            case GTN: c = (a > b) ? 1 : 0; break;
            case NEQ: c = (a !== b) ? 1 : 0; break;
            default:  c = 0; break;
          }
          clear(MEM, get_loc(term,0), 2);
          return link(MEM, host, U_32(c));
        }
        // (+ &A<a0 a1> b)
        // --------------- OP2-PAR
        // !A<b0 b1> = b
        // &A<(+ a0 b0) (+ a1 b1)>
        if (get_tag(val0) == PAR) {
          var op20 = get_loc(term, 0);
          var op21 = get_loc(val0, 0);
          var let0 = alloc(MEM, 3);
          var par0 = alloc(MEM, 2);
          link(MEM, let0+2, val1);
          link(MEM, op20+1, Dp0(get_col(val0), let0));
          link(MEM, op20+0, get_lnk(MEM, val0, 0));
          link(MEM, op21+0, get_lnk(MEM, val0, 1));
          link(MEM, op21+1, Dp1(get_col(val0), let0));
          link(MEM, par0+0, Op2(get_ope(term), op20));
          link(MEM, par0+1, Op2(get_ope(term), op21));
          return link(MEM, host, Par(get_col(val0), par0));
        }
        // (+ a &A<b0 b1>)
        // --------------- OP2-PAR
        // !A<a0 a1> = a
        // &A<(+ a0 a1) (+ b0 b1)>
        if (get_tag(val1) == PAR) {
          var op20 = get_loc(term, 0);
          var op21 = get_loc(val1, 0);
          var let0 = alloc(MEM, 3);
          var par0 = alloc(MEM, 2);
          link(MEM, let0+2, val0);
          link(MEM, op20+1, Dp0(get_col(val1), let0));
          link(MEM, op20+0, get_lnk(MEM, val1, 0));
          link(MEM, op21+0, get_lnk(MEM, val1, 1));
          link(MEM, op21+1, Dp1(get_col(val1), let0));
          link(MEM, par0+0, Op2(get_ope(term), op20));
          link(MEM, par0+1, Op2(get_ope(term), op21));
          return link(MEM, host, Par(get_col(val1), par0));
        }
        break;
      }
      case DP0:
      case DP1: {
        let expr = reduce(MEM, get_loc(term,2));
        switch (get_tag(expr)) {
          // !A<r s> = λx f
          // --------------- LET-LAM
          // !A<f0 f1> = f
          // r <- λx0: f0
          // s <- λx1: f1
          // x <- &A<x0 x1>
          // ~
          case LAM: {
            //console.log("[let-lam] " + get_loc(term,0) + " " + get_loc(expr,0));
            ++GAS;
            var let0 = get_loc(term, 0);
            var par0 = get_loc(expr, 0);
            var lam0 = alloc(MEM, 2);
            var lam1 = alloc(MEM, 2);

            link(MEM, let0+2, get_lnk(MEM, expr, 1));         // r: par0[1] w: let0[2]
            link(MEM, par0+1, Var(lam1));                     // w: par0[1] lam1[0]

            var expr_lnk_0 = get_lnk(MEM, expr, 0);
            link(MEM, par0+0, Var(lam0));                     // w: par0[0] lam0[0]
            subst(MEM, expr_lnk_0, Par(get_col(term), par0)); // r: par0[0]

            var term_lnk_0 = get_lnk(MEM,term,0);
            link(MEM, lam0+1, Dp0(get_col(term), let0));      // w: lam0[1] let0[0]
            subst(MEM, term_lnk_0, Lam(lam0));                // r: let0[0]

            var term_lnk_1 = get_lnk(MEM,term,1);                      
            link(MEM, lam1+1, Dp1(get_col(term), let0));      // w: lam1[1] let0[1]
            subst(MEM, term_lnk_1, Lam(lam1));                // r: let0[1]

            link(MEM, host, Lam(get_tag(term) == DP0 ? lam0 : lam1));
            continue;

            //var lam0 = alloc(MEM, 2);
            //var lam1 = alloc(MEM, 2);
            //var par0 = alloc(MEM, 2);
            //var let0 = alloc(MEM, 3);
            //link(MEM, lam0+1, lnk(DP0, get_ex0(term), 0, let0));
            //link(MEM, lam1+1, lnk(DP1, get_ex0(term), 0, let0));
            //link(MEM, par0+0, lnk(VAR, 0, 0, lam0));
            //link(MEM, par0+1, lnk(VAR, 0, 0, lam1));
            //link(MEM, let0+2, get_lnk(MEM, expr, 1));
            //subst(MEM, get_lnk(MEM,term,0), lnk(LAM, 0, 0, lam0));
            //subst(MEM, get_lnk(MEM,term,1), lnk(LAM, 0, 0, lam1));
            //subst(MEM, get_lnk(MEM,expr,0), lnk(PAR, get_ex0(term), 0, par0));
            //link(MEM, host, lnk(LAM, 0, 0, get_tag(term) === DP0 ? lam0 : lam1));
            //clear(MEM, get_loc(term,0), 3);
            //clear(MEM, get_loc(expr,0), 2);
            //continue;
          }
          // !A<x y> = !B<a b>
          // ----------------- LET-PAR
          // if A == B then
          //   x <- a
          //   y <- b
          //   ~
          // else
          //   x <- !B<xA xB>
          //   y <- !B<yA yB>
          //   !A<xA yA> = a
          //   !A<xB yB> = b
          //   ~
          case PAR: {
            ++GAS;
            //console.log("[let-par] " + get_loc(term,0) + " " + get_loc(expr,0));
            if (get_col(term) === get_col(expr)) {
              subst(MEM, get_lnk(MEM,term,0), get_lnk(MEM,expr,0));
              subst(MEM, get_lnk(MEM,term,1), get_lnk(MEM,expr,1));
              link(MEM, host, get_lnk(MEM, expr, get_tag(term) === DP0 ? 0 : 1));
              clear(MEM, get_loc(term,0), 3);
              clear(MEM, get_loc(expr,0), 2);
              continue;
            } else {

              var par0 = alloc(MEM, 2);
              var let0 = get_loc(term,0);
              var par1 = get_loc(expr,0);
              var let1 = alloc(MEM, 3);

              link(MEM, let0+2, get_lnk(MEM,expr,0));                         // w:let0[2] r:par1[0]
              link(MEM, let1+2, get_lnk(MEM,expr,1));                         // w:let1[2] r:par1[1]

              var term_lnk_1 = get_lnk(MEM,term,1);
              link(MEM, par1+0, Dp1(get_col(term),let0));               // w:par1[0] w:let0[1]
              link(MEM, par1+1, Dp1(get_col(term),let1));               // w:par1[1] w:let1[1]
              subst(MEM, term_lnk_1, Par(get_col(expr),par1));          // r:let0[1] d:par1

              var term_lnk_0 = get_lnk(MEM,term,0);
              link(MEM, par0+0, Dp0(get_col(term),let0));               // w:par0[0] w:let0[0]
              link(MEM, par0+1, Dp0(get_col(term),let1));               // w:par0[1] w:let1[0]
              subst(MEM, term_lnk_0, Par(get_col(expr),par0));          // r:let0[0] d:par0

              return link(MEM, host, Par(get_col(expr), get_tag(term) === DP0 ? par0 : par1));

              //var par0 = alloc(MEM, 2);
              //var par1 = alloc(MEM, 2);
              //var let0 = alloc(MEM, 3);
              //var let1 = alloc(MEM, 3);
              //link(MEM, par0+0, lnk(DP0,get_ex0(term),0,let0));
              //link(MEM, par0+1, lnk(DP0,get_ex0(term),0,let1));
              //link(MEM, par1+0, lnk(DP1,get_ex0(term),0,let0));
              //link(MEM, par1+1, lnk(DP1,get_ex0(term),0,let1));
              //link(MEM, let0+2, get_lnk(MEM,expr,0));
              //link(MEM, let1+2, get_lnk(MEM,expr,1));
              //subst(MEM, get_lnk(MEM,term,0), lnk(PAR,get_ex0(expr),0,par0));
              //subst(MEM, get_lnk(MEM,term,1), lnk(PAR,get_ex0(expr),0,par1));
              //link(MEM, host, lnk(PAR, get_ex0(expr), 0, get_tag(term) === DP0 ? par0 : par1));
              //clear(MEM, get_loc(term,0), 3);
              //clear(MEM, get_loc(expr,0), 2);
              ////console.log(show_term(MEM, deref(MEM, 0)));
              //return deref(MEM, host);
            }
          }
          // !A<x y> = $V:L{a b c ...}
          // -------------------------
          // !A<a0 a1> = a
          // !A<b0 b1> = b
          // !A<c0 c1> = c
          // ...
          // x <- $V:L{a0 b0 c0 ...}
          // y <- $V:L{a1 b1 c1 ...}
          // ~
          case CTR: {
            ++GAS;
            let func = get_fun(expr);
            let arit = get_ari(expr);
            if (arit === 0) {
              subst(MEM, get_lnk(MEM,term,0), Ctr(func, 0, 0));
              subst(MEM, get_lnk(MEM,term,1), Ctr(func, 0, 0));
              clear(MEM, get_loc(term,0), 3);
              return link(MEM, host, Ctr(func, 0, 0));
            } else {
              let ctr0 = get_loc(expr,0);
              let ctr1 = alloc(MEM, arit);
              var term_lnk_0 = get_lnk(MEM,term,0);
              var term_lnk_1 = get_lnk(MEM,term,1);
              for (let i = 0; i < arit; ++i) {
                let leti = i === 0 ? get_loc(term,0) : alloc(MEM, 3);
                var expr_lnk_i = get_lnk(MEM, expr, i);
                link(MEM, ctr0+i, Dp0(get_col(term), leti));
                link(MEM, ctr1+i, Dp1(get_col(term), leti));
                link(MEM, leti+2, expr_lnk_i);
              }
              subst(MEM, term_lnk_0, Ctr(func, arit, ctr0));
              subst(MEM, term_lnk_1, Ctr(func, arit, ctr1));
              return link(MEM, host, Ctr(func, arit, get_tag(term) === DP0 ? ctr0 : ctr1));
            }
            //let ctr0 = alloc(MEM, arit);
            //let ctr1 = alloc(MEM, arit);
            //for (let i = 0; i < arit; ++i) {
              //let leti = alloc(MEM, 3);
              //link(MEM, ctr0+i, lnk(DP0, 0, 0, leti));
              //link(MEM, ctr1+i, lnk(DP1, 0, 0, leti));
              //link(MEM, leti+2, get_lnk(MEM,expr,i));
            //}
            //subst(MEM, get_lnk(MEM,term,0), lnk(CTR, func, arit, ctr0));
            //subst(MEM, get_lnk(MEM,term,1), lnk(CTR, func, arit, ctr1));
            //link(MEM, host, lnk(CTR, func, arit, get_tag(term) === DP0 ? ctr0 : ctr1));
            //clear(MEM, get_loc(term,0), 3);
            //clear(MEM, get_loc(expr,0), arit);
            //return deref(MEM, host);
          }
          // !A<x y> = #k
          // ------------
          // x <- #k
          // y <- #k
          // ~
          case U32: {
            subst(MEM, get_lnk(MEM,term,0), expr);
            subst(MEM, get_lnk(MEM,term,1), expr);
            link(MEM, host, expr);
            continue;
          }
        }
        break;
      }
      case CAL: {
        //console.log("call", get_ex0(term));
        switch (get_fun(term))
        //GENERATED_REWRITE_RULES_START//
        {
//GENERATED_REWRITE_RULES//
        }
        //GENERATED_REWRITE_RULES_END//
      }
      break;
    }
    return term;
  }
}

export function normal(MEM: Mem, host: number) : number {
  GAS = 0;
  normal_go(MEM, host, {});
  return GAS;
}

function normal_go(MEM: Mem, host: number, seen: MAP<boolean>) : Lnk {
  var term = deref(MEM, host);
  if (seen[host]) {
    return term;
  } else {
    term = reduce(MEM, host);
    seen[host] = true;
    switch (get_tag(term)) {
      case LAM: {
        link(MEM, get_loc(term,1), normal_go(MEM, get_loc(term,1), seen));
        return term;
      }
      case APP: {
        link(MEM, get_loc(term,0), normal_go(MEM, get_loc(term,0), seen));
        link(MEM, get_loc(term,1), normal_go(MEM, get_loc(term,1), seen));
        return term;
      }
      case PAR: {
        link(MEM, get_loc(term,0), normal_go(MEM, get_loc(term,0), seen));
        link(MEM, get_loc(term,1), normal_go(MEM, get_loc(term,1), seen));
        return term;
      }
      case DP0: {
        link(MEM, get_loc(term,2), normal_go(MEM, get_loc(term,2), seen));
        return term;
      }
      case DP1: {
        link(MEM, get_loc(term,2), normal_go(MEM, get_loc(term,2), seen));
        return term;
      }
      case CAL:
      case CTR: {
        var arity = get_ari(term);
        for (var i = 0; i < arity; ++i) {
          link(MEM, get_loc(term,i), normal_go(MEM, get_loc(term,i), seen));
        }
        return term;
      }
      default: {
        return term;
      }
    }
  }
}

// Debug
// -----

export function debug_show(MEM: Mem, term: Lnk, table: {[str:string]:string}) : string {
  var lets : {[key:string]:number} = {};
  var kinds : {[key:string]:number} = {};
  var names : {[key:string]:string} = {};
  var count = 0;
  function find_lets(term: Lnk) {
    switch (get_tag(term)) {
      case LAM: {
        names[get_loc(term,0)] = String(++count);
        find_lets(get_lnk(MEM, term, 1));
        break;
      }
      case APP: {
        find_lets(get_lnk(MEM, term, 0));
        find_lets(get_lnk(MEM, term, 1));
        break;
      }
      case PAR: {
        find_lets(get_lnk(MEM, term, 0));
        find_lets(get_lnk(MEM, term, 1));
        break;
      }
      case DP0: {
        if (!lets[get_loc(term,0)]) {
          names[get_loc(term,0)] = String(++count);
          kinds[get_loc(term,0)] = get_col(term);
          lets[get_loc(term,0)] = get_loc(term,0);
          find_lets(get_lnk(MEM, term, 2));
        }
        break;
      }
      case DP1: {
        if (!lets[get_loc(term,0)]) {
          names[get_loc(term,0)] = String(++count);
          kinds[get_loc(term,0)] = get_col(term);
          lets[get_loc(term,0)] = get_loc(term,0);
          find_lets(get_lnk(MEM, term, 2));
        }
        break;
      }
      case CAL:
      case CTR: {
        var arity = get_ari(term);
        for (var i = 0; i < arity; ++i) {
          find_lets(get_lnk(MEM, term,i));
        }
        break;
      }
      case OP2: {
        find_lets(get_lnk(MEM, term, 0));
        find_lets(get_lnk(MEM, term, 1));
        break;
      }
    }
  }
  function go(term: Lnk) : string {
    switch (get_tag(term)) {
      case LAM: {
        var name = "x" + (names[get_loc(term,0)] || "?");
        return "λ" + name + " " + go(get_lnk(MEM, term, 1));
      }
      case APP: {
        let func = go(get_lnk(MEM, term, 0));
        let argm = go(get_lnk(MEM, term, 1));
        return "(" + func + " " + argm + ")";
      }
      case PAR: {
        let kind = get_col(term);
        let func = go(get_lnk(MEM, term, 0));
        let argm = go(get_lnk(MEM, term, 1));
        return "&" + kind + "<" + func + " " + argm + ">";
      }
      case CAL:
      case CTR: {
        let func = get_fun(term);
        let arit = get_ari(term);
        let args = [];
        for (let i = 0; i < arit; ++i) {
          args.push(go(get_lnk(MEM, term, i)));
        }
        if (table && table[func]) {
          return "(" + table[func] + args.map(x => " " + x).join("") + ")";
        } else {
          return "(F" + func + args.map(x => " " + x).join("") + ")";
        }
      }
      case DP0: {
        return "a" + (names[get_loc(term,0)] || "?");
      }
      case DP1: {
        return "b" + (names[get_loc(term,0)] || "?");
      }
      case VAR: {
        return "x" + (names[get_loc(term,0)] || "?");
      }
      case OP2: {
        let oper = get_ope(term);
        let val0 = go(get_lnk(MEM, term, 0));
        let val1 = go(get_lnk(MEM, term, 1));
        return "#{" + oper + " " + val0 + " " + val1 + "}";
      }
      case U32: {
        return "#" + get_num(term);
      }
    }
    return "<?" + term + ">";
  }
  find_lets(term);
  var text = go(term);
  for (var key of Object.keys(lets).reverse()) {
    var pos  = lets[key];
    var kind = kinds[key] || 0;
    var name = names[pos] || "?";
    var nam0 = deref(MEM, pos+0) === Nil() ? "*" : "a"+name;
    var nam1 = deref(MEM, pos+1) === Nil() ? "*" : "b"+name;
    text += " !" + kind + "<"+nam0+" "+nam1+"> = " + go(deref(MEM, pos + 2)) + ";";
  }
  //text += go(term);
  return text;
}
