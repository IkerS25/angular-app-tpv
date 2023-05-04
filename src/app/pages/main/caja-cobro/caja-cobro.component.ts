import { Component } from '@angular/core';
import { DxBoxModule, DxDataGridModule, DxFormModule, DxPopupModule } from 'devextreme-angular';
import { DxiItemModule } from 'devextreme-angular/ui/nested';
import { Producto } from 'src/app/models/producto';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { VentaService } from '../../../services/venta.service';
import { CommonModule } from '@angular/common';
import { Categoria } from 'src/app/models/categoria';
import { Empleado } from 'src/app/models/empleado';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Venta } from 'src/app/models/venta';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-caja-cobro',
  templateUrl: './caja-cobro.component.html',
  styleUrls: ['./caja-cobro.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DxiItemModule,
    DxBoxModule,
    DxDataGridModule,
    DxPopupModule,
    DxFormModule,
    DxBoxModule,
    FormsModule

  ]
})
export class CajaCobroComponent {
  // Lista de productos que se rellena al cargar la pagina ya que esta ubicado en el ngOnInit
  productos: Producto[] = [];
  // Lista de productos a la que se le aplica un filtro para mostrar solo los productos filtrados
  productosFiltrados: Producto[] = [];
  // Booleano que en caso de esar true, nos da la posibilidad de mostrar otro div en la vista diciendo que no hay ningun producto
  listaVaciaProductos = undefined;
  // Lista de categorias que se rellena al cargar la pagina ya que esta ubicado en el ngOnInit
  categorias: Categoria[] = [];
  // Booleano que en caso de esar true, nos da la posibilidad de mostrar otro div en la vista diciendo que no hay ninguna categoria
  listaVaciaCategorias = undefined;
  // Lista de empleados que se rellena al cargar la pagina ya que esta ubicado en el ngOnInit
  empleados: Empleado[] = [];
  // Booleano que en caso de esar true, nos da la posibilidad de mostrar otro div en la vista diciendo que no hay ningun empleado
  listaVaciaEmpleados = undefined;
  // La lista de cobro en la que se iran añadiendo productos cuando los vayamos seleccionando
  listaProductosSeleccionados: Producto[] = [];
  // Almacena el id de la categoria seleccionada para poder filtrar la lista productosFiltrados por este
  idCategoriaSeleccionada: number | null = null;
  // Nombre de la categoria que se muestra al hacer click en la categoria
  categoriaSeleccionada: string = '';
  // Almacena la categoria seleccionada en un array
  _categoriaSeleccionada: Categoria[] | null = null;
  // El precio total que ira aumentando cuando vayamos haciendo click en los productos.
  precioTotal: string = "0.00 €";
  // El cambio del cobro, por defecto sera 0.
  cambioCobro: number = 0;
  // El dinero que queda pendiente de cobrar, por defecto, si es efectivo sera el precio total.
  pendienteCobroEfectivo: number = 0;
  // El dinero que queda pendiente de cobrar, por defecto, si es efectivo sera el precio total.
  pendienteCobroTarjeta: number = 0;
  // El dinero efectivo que se ha entregado
  entregadoCobroEfectivo: number | null = null;
  // El dinero efectivo que se ha entregado, por defecto, sera el precio total.
  entregadoCobroTarjeta: number | null = null;
  //El empleado que se mostrara en el popup de pago.
  nombreEmpleadoPopup = "";
  // Establece la visibilidad del popup de cobro a false
  employeePopupVisible = false;
  // El titulo del popup de empleados.
  employeePopupTitle: string = "Seleccione un empleado";
  // Establece la visibilidad del popup del tipo de cobro a false
  chargeTypePopupVisible = false;
  // El titulo del popup del tipo de cobro.
  chargeTypePopupTitle: string = "Seleccione un tipo de cobro";
  // Establece la visibilidad del popup del pago en efectivo a false
  cashPaymentPopupVisible = false;
  // El titulo del popup del pago en efectivo.
  cashPaymentPopupTitle: string = this.nombreEmpleadoPopup;
  // Establece la visibilidad del popup del pago en tarjeta a false
  cardPaymentPopupVisible = false;
  // El titulo del popup del pago en tarjeta.
  cardPaymentPopupTitle: string = this.nombreEmpleadoPopup;
  // El tipo de pago registrado actualmente
  tipoPagoRegistrado: string | null = null;
  // El empleado registrado actualmente
  empleadoRegistrado: Empleado | null = null;





  constructor(
    private router: Router,
    private ventaService: VentaService,
    private empleadoService: EmpleadoService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private toastr: ToastrService,
  ) { }

  // Almacena los productos y categorias en sus correspondientes listas al cargar la pagina.
  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarEmpleados();
  }

  //Carga los empleados en la lista empleados, en caso de no haber ninguno, devuelve un error.
  cargarEmpleados(): void {
    this.empleadoService.lista().subscribe(
      data => {
        this.empleados = data;
        this.listaVaciaEmpleados = undefined;
      },
      err => {
        this.listaVaciaEmpleados = err.error.message;
      }
    );
  }

  //Carga los productos en la lista productos, en caso de no haber ninguno, devuelve un error.
  cargarProductos(): void {
    this.productoService.lista().subscribe(
      data => {
        this.productos = data;
        this.listaVaciaProductos = undefined;
        this.productosFiltrados = this.productos;
      },
      err => {
        this.listaVaciaProductos = err.error.message;
      }
    );
  }

  //Carga las categorias en la lista categorias, en caso de no haber ninguna, devuelve un error.
  cargarCategorias(): void {
    this.categoriaService.lista().subscribe(
      data => {
        this.categorias = data;
        this.listaVaciaCategorias = undefined;
      },
      err => {
        this.listaVaciaCategorias = err.error.message;
      }
    );
  }
  // Comprueba si el producto que se le pasa por parámetro, existe en la lista de productos seleccioandos
  comprobarExiste(producto: Producto) {

    for (const productoLista of this.listaProductosSeleccionados) {
      if (productoLista == producto) {
        return true;
      }
    }
    return false
  }

  // Añade a la lista el producto cuando se hace click en el boton.
  agregarProductoSeleccionado(producto: Producto) {
    let contador = 0;
    let salir = false;
    if (this.listaProductosSeleccionados.length == 0 || !this.comprobarExiste(producto)) {
      this.listaProductosSeleccionados.push(producto);

    } else {
      while (contador <= this.listaProductosSeleccionados.length && !salir) {

        if (producto.id == this.listaProductosSeleccionados[contador].id) {
          this.listaProductosSeleccionados[contador].cantidad++;
          salir = true;
        }
        contador++;
      }
    }

    // Convierte el precio total a un numero cambiando la coma por un punto y quitando el simbolo del euro
    let valorNumerico: number = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));

    valorNumerico = valorNumerico + producto.precio;
    this.pendienteCobroEfectivo = valorNumerico;
    this.precioTotal = this.formatPrecio(valorNumerico);

  }

  // Almacena la categoria seleccionada para mostrar solo los productos de esa categoria
  almacenarCategoriaSeleccionada(categoria: number) {
    this.idCategoriaSeleccionada = categoria;

    this._categoriaSeleccionada = this.categorias.filter(categoria => categoria.id == this.idCategoriaSeleccionada);
    this.categoriaSeleccionada = this._categoriaSeleccionada[0].nombre;

    //Vuelve a asignar todos los productos a la lista de productos filtrados para volver a filtrar.
    this.productosFiltrados = this.productos;
    this.productosFiltrados = this.productosFiltrados.filter(producto => producto.idCategoria == this.idCategoriaSeleccionada);
  }

  // Formatea el valor del precio.
  formatPrecio(precio: number): string {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(precio);
  }

  // Muestra la primera ventana emergente al hacer click en el boton de cobrar.
  employeeShowPopup() {
    if (!this.empleadoRegistrado) {
      this.employeePopupVisible = true;
    } else {
      this.chargeTypeShowPopup();
    }

  }

  // Cierra la primera ventana emergente al hacer click afuera de esta o en el boton de cerrar.
  onEmloyeePopupHiding() {
    this.employeePopupVisible = false;
  }

  // Muestra la  segunda ventana emergente al hacer click en el boton de cobrar.
  chargeTypeShowPopup() {
    this.chargeTypePopupVisible = true;
  }

  // Cierra la segunda ventana emergente al hacer click afuera de esta o en el boton de cerrar.
  onChargeTypePopupHiding() {
    this.chargeTypePopupVisible = false;
  }

  // Muestra la ventana emergente al hacer click pago en efectivo.
  cashPaymentShowPopup() {
    let cuadroPendienteEfectivo = document.getElementById("pendienteItemEfectivo");
    if (cuadroPendienteEfectivo?.classList.contains("errorPendiente")) {
      cuadroPendienteEfectivo?.classList.remove("errorPendiente");
    }
    this.cashPaymentPopupTitle = "Empleado: " + this.empleadoRegistrado!.nombre;
    this.cashPaymentPopupVisible = true;
    this.pendienteCobroEfectivo = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));
  }

  // Cierra la segunda ventana emergente al hacer click afuera de esta o en el boton de cerrar.
  cashPaymentPopupHiding() {
    this.cashPaymentPopupVisible = false;
    this.pendienteCobroEfectivo = 0;
    this.cambioCobro = 0;
    this.entregadoCobroEfectivo = null;
  }

  // Muestra la ventana emergente al hacer click pago en efectivo.
  cardPaymentShowPopup() {
    let cuadroPendienteTarjeta = document.getElementById("pendienteItemTarjeta");
    if (cuadroPendienteTarjeta?.classList.contains("errorPendiente")) {
      cuadroPendienteTarjeta?.classList.remove("errorPendiente");
    }
    this.cardPaymentPopupTitle = "Empleado: " + this.empleadoRegistrado!.nombre;
    this.cardPaymentPopupVisible = true;
    let precioTotal = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));
    this.entregadoCobroTarjeta = precioTotal;
    this.pendienteCobroTarjeta = this.entregadoCobroTarjeta - precioTotal;
  }

  // Cierra la segunda ventana emergente al hacer click afuera de esta o en el boton de cerrar.
  cardPaymentPopupHiding() {
    this.cardPaymentPopupVisible = false;
    this.pendienteCobroEfectivo = 0;
    this.pendienteCobroTarjeta = 0;
    this.cambioCobro = 0;
    this.entregadoCobroEfectivo = null;
  }
  //Almacena el empleado seleccionado para poder realizar el cobro.
  registrarEmpleado(empleado: Empleado) {
    this.empleadoRegistrado = empleado;
    if (!this.cardPaymentPopupVisible && !this.cashPaymentPopupVisible) {
      this.onEmloyeePopupHiding();
      this.chargeTypeShowPopup();
    } else {
      if (this.cardPaymentPopupVisible) {
        this.cardPaymentPopupTitle = "Empleado: " + this.empleadoRegistrado!.nombre;
        this.onEmloyeePopupHiding();
      } else if (this.cashPaymentPopupVisible) {
        this.cashPaymentPopupTitle = "Empleado: " + this.empleadoRegistrado!.nombre;
        this.onEmloyeePopupHiding();
      }
    }

  }


  // Almacena el tipo de pago seleccionado en el popup.
  registrarTipoPago(e: Event) {
    this.tipoPagoRegistrado = (e.target as HTMLButtonElement).getAttribute('value');
    if (this.tipoPagoRegistrado == '0') {
      this.onChargeTypePopupHiding()
      this.cashPaymentShowPopup();
    }
    if (this.tipoPagoRegistrado == '1') {
      this.onChargeTypePopupHiding()
      this.cardPaymentShowPopup();
    }
  }

  // Actualiza en el tipo de pago efectivo el precio pendiente de cobro y en caso de que el entregado sea mayor al precio total, actualiza el cambio.
  actualizarPrecioEfectivo() {
    let cuadroPendiente = document.getElementById("pendienteItemEfectivo");
    if (this.pendienteCobroEfectivo == 0) {
      cuadroPendiente?.classList.remove("errorPendiente");
    }

    let precioTotal = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));

    this.pendienteCobroEfectivo = precioTotal - this.entregadoCobroEfectivo!;
    if (this.entregadoCobroEfectivo == null) {
      this.pendienteCobroEfectivo = precioTotal;
      this.cambioCobro = 0;

    } else {
      if ((this.entregadoCobroEfectivo - precioTotal) > 0) {
        this.cambioCobro = this.entregadoCobroEfectivo - precioTotal;
        this.pendienteCobroEfectivo = 0;
      } else {
        this.cambioCobro = 0;
      }
    }
    if (this.pendienteCobroEfectivo == 0) {
      cuadroPendiente?.classList.remove("errorPendiente");
    }
  }

  // Actualiza en el tipo de pago efectivo el precio pendiente de cobro y en caso de que el entregado sea mayor al precio total, actualiza el cambio.
  actualizarPrecioTarjeta() {
    let cuadroPendiente = document.getElementById("pendienteItemTarjeta");
    if (this.pendienteCobroTarjeta == 0) {
      cuadroPendiente?.classList.remove("errorPendiente");
    }
    let precioTotal = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));
    this.pendienteCobroTarjeta = precioTotal - this.entregadoCobroTarjeta!;
    if (this.entregadoCobroTarjeta == null) {
      this.pendienteCobroTarjeta = precioTotal;
      this.cambioCobro = 0;

    } else {
      if ((this.entregadoCobroTarjeta - precioTotal) > 0) {
        this.cambioCobro = this.entregadoCobroTarjeta - precioTotal;
        this.pendienteCobroTarjeta = 0;
      } else {
        this.cambioCobro = 0;
      }
    }
    if (this.pendienteCobroEfectivo == 0) {
      cuadroPendiente?.classList.remove("errorPendiente");
    }
  }

  crearVenta(): void {
    let cuadroPendienteEfectivo = document.getElementById("pendienteItemEfectivo");
    let cuadroPendienteTarjeta = document.getElementById("pendienteItemTarjeta");

    if (this.pendienteCobroEfectivo > 0 || this.pendienteCobroTarjeta > 0) {
      cuadroPendienteEfectivo?.classList.add("errorPendiente");
      cuadroPendienteTarjeta?.classList.add("errorPendiente");
    } else {
      let cuadroPendienteEfectivo = document.getElementById("pendienteItemEfectivo");

      cuadroPendienteEfectivo?.classList.remove("errorPendiente");
      cuadroPendienteTarjeta?.classList.remove("errorPendiente");
      let precioTotal = parseFloat(this.precioTotal.replace(",", ".").replace("€", ""));
      const metodo_pago: string = this.tipoPagoRegistrado == '0' ? "Efectivo" : "Tarjeta"

      const fechaActual = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const venta = new Venta(this.empleadoRegistrado!.codEmpleado, metodo_pago, fechaActual!, precioTotal);
      this.ventaService.save(venta).subscribe(
        data => {
          this.toastr.success(data.message, 'OK', {
            timeOut: 3000, positionClass: 'toast-top-center'
          });
          if (this.cashPaymentPopupVisible) {
            this.cashPaymentPopupHiding();
            this.listaProductosSeleccionados = [];
            this.precioTotal = "0.00 €";
            this.pendienteCobroEfectivo = 0;
            this.cambioCobro = 0;
            this.empleadoRegistrado = null;
          } else if (this.cardPaymentPopupVisible) {
            this.cardPaymentPopupHiding();
            this.listaProductosSeleccionados = [];
            this.precioTotal = "0.00 €";
            this.pendienteCobroTarjeta = 0;
            this.cambioCobro = 0;
            this.empleadoRegistrado = null;
          }
        },
        err => {
          this.toastr.error(err.error.message, 'Fail', {
            timeOut: 3000, positionClass: 'toast-top-center',
          });
        }
      );
    }

  }
  //Vuelve al popup del tipo de cobro
  volverTipoCobro() {
    if (this.cardPaymentPopupVisible) {
      this.cardPaymentPopupHiding();
      this.chargeTypeShowPopup();
    } else if (this.cashPaymentPopupVisible) {
      this.cashPaymentPopupHiding()
      this.chargeTypeShowPopup();
    }
  }
  //Abre el popup de empleados para poder cambiar de empleado.
  cambiarEmpleadoPopup() {
    this.employeePopupVisible = true;
  }
  //Registra que tecla se ha tocado en el teclado en pantalla y simula la pulsacion de esta en el teclado.
  accionesTecladoPantalla(e: any) {
    let input;
    if (this.cashPaymentPopupVisible) {
      input = document.getElementById('cobroEfectivo') as HTMLInputElement;

    } else if (this.cardPaymentPopupVisible) {
      input = document.getElementById('cobroTarjeta') as HTMLInputElement;
    }
    if (input) {
      input.focus();
      switch (e.target.value) {
        case '1':
          input.value += '1';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '2':
          input.value += '2';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '3':
          input.value += '3';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '4':
          input.value += '4';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '5':
          input.value += '5';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '6':
          input.value += '6';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '7':
          input.value += '7';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '8':
          input.value += '8';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case '9':
          input.value += '9';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case ',':
          if (!input.value.includes(".")) {
            input.value += '.';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('change'));
          }
          break;
        case '0':
          input.value += '0';
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
        case 'delete':
          input.value = input.value.slice(0, -1);
          input.dispatchEvent(new Event('input'));
          input.dispatchEvent(new Event('change'));
          break;
      }
    }

  }
  // Boton salir, tambien controla si los popups de pago estan abiertos y actua como boton de cerrar de estos.
  salir() {
    if (this.cardPaymentPopupVisible) {
      this.cardPaymentPopupHiding();
    } else if (this.cashPaymentPopupVisible) {
      this.cashPaymentPopupHiding()
    } else {
      this.router.navigate(['/main']);
    }
  }
}