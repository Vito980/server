constante express = require('express');
const bodyParser = require('body-parser');
constante cors = require('cors');
constante path = require('path');

constante aplicación = express();
constante PUERTO = 3000;

deje que latestSensorData = null;
deje que allSensorsData = {};

aplicación.use(cors());
aplicación.use(bodyParser.json());

función decodeUplink(entrada){

	var datos_decodificados = {};
	var decodificador = [];
	var errores = [];
	var bytes = convertToUint8Array(entrada.bytes);
	datos_decodificados['raw'] = toHexString(bytes).toUpperCase();
	datos_decodificados['fPort'] = entrada.fPort;

	si(entrada.fPuerto === 101){
		decodificador = [
			{
				llave: [],
				fn: función(arg) {
					var tamaño = arg.longitud;
					var registros_inválidos = [];
					var respuestas = [];
					mientras(arg.length > 0){
						var enlace descendente_fcnt = arg[0];
						var num_escrituras_inválidas = arg[1];
						arg = arg.slice(2);
						si(num_escrituras_inválidas > 0) {
							para(var i = 0; i < núm_escrituras_inválidas; i++){
								registros_inválidos.push("0x" + arg[i].toString(16));
							}
							arg = arg.slice(num_escrituras_inválidas);
							respuestas.push(num_invalid_writes + ' Comando(s) de escritura no válido(s) de DL:' + downlink_fcnt + ' para registro(s): ' + invalid_registers);
						}
						demás {
							responses.push('Todos los comandos de escritura de DL:' + downlink_fcnt + 'fueron exitosos');
						}
						registros_inválidos = [];
					}
					decoded_data["response"] = respuestas;
					tamaño de retorno;
				}
			}
		];
	}

si (entrada.fPort === 10) {
	decodificador = [
		{
			clave: [0x00, 0xD3],
			fn: función(arg) {
				datos_decodificados['tiempo_de_vida_de_la_batería_pct'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x00, 0xBD],
			fn: función(arg) {
				datos_decodificados['duración_vida_de_la_batería_dys'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x00, 0x85],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('utc')) {
					datos_decodificados['utc'] = {};
				}
				datos_decodificados['utc']['año_utc'] = campo_decodificación(arg, 4, 31, 26, "sin signo");
				datos_decodificados['utc']['mes_utc'] = campo_decodificación(arg, 4, 25, 22, "sin signo");
				datos_decodificados['utc']['día_utc'] = campo_decodificación(arg, 4, 21, 17, "sin signo");
				datos_decodificados['utc']['hora_utc'] = campo_decodificación(arg, 4, 16, 12, "sin signo");
				datos_decodificados['utc']['minuto_utc'] = campo_decodificación(arg, 4, 11, 6, "sin signo");
				datos_decodificados['utc']['segundo_utc'] = campo_decodificación(arg, 4, 5, 0, "sin signo");
				devolver 4;
			}
		},
		{
			clave: [0x00, 0x88],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('coordenadas')) {
					datos_decodificados['coordenadas'] = {};
				}
				datos_decodificados['coordenadas']['latitud'] = (campo_decodificado(arg, 8, 63, 40, "signed") * 0.00001072883606).toFixed(7);
				datos_decodificados['coordenadas']['longitud'] = (campo_decodificación(arg, 8, 39, 16, "signed") * 0.00002145767212).toFixed(7);
				datos_decodificados['coordenadas']['altitud'] = (campo_decodificación(arg, 8, 15, 0, "sin signo") * 0.144958496 + -500).toFixed(2);
				devolver 8;
			}
		},
		{
			clave: [0x00, 0x92],
			fn: función(arg) {
				datos_decodificados['velocidad_terrestre'] = (campo_decodificación(arg, 1, 7, 0, "sin signo") * 0.27778 ).toFixed(3);
				devuelve 1;
			}
		},
		{
			clave: [0x00, 0x00],
			fn: función(arg) {
				datos_decodificados['gnss_fix'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x00, 0x95],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_status')) {
					datos_decodificados['gnss_status'] = {};
				}
				var val = decode_field(arg, 1, 1, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_status']['gnss_status_dz0'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['gnss_status']['gnss_status_dz0'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['gnss_status']['gnss_status_dz0'] = "Afuera";
						romper;
					por defecto:
						datos_decodificados['gnss_status']['gnss_status_dz0'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 3, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_status']['gnss_status_dz1'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['gnss_status']['gnss_status_dz1'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['gnss_status']['gnss_status_dz1'] = "Afuera";
						romper;
					por defecto:
						datos_decodificados['gnss_status']['gnss_status_dz1'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 5, 4, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_status']['gnss_status_dz2'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['gnss_status']['gnss_status_dz2'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['gnss_status']['gnss_status_dz2'] = "Afuera";
						romper;
					por defecto:
						datos_decodificados['gnss_status']['gnss_status_dz2'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 7, 6, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_status']['gnss_status_dz3'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['gnss_status']['gnss_status_dz3'] = "Dentro";
						romper;
					caso 2:
						decoded_data['gnss_status']['gnss_status_dz3'] = "Afuera";
						romper;
					por defecto:
						datos_decodificados['gnss_status']['gnss_status_dz3'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x01, 0x95],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_status')) {
					datos_decodificados['ble_status'] = {};
				}
				var val = decode_field(arg, 1, 1, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['ble_status']['ble_status_dz0'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['ble_status']['ble_status_dz0'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['ble_status']['ble_status_dz0'] = "Afuera";
						romper;
					caso 3:
						datos_decodificados['ble_status']['ble_status_dz0'] = "Cerca";
						romper;
					por defecto:
						datos_decodificados['ble_status']['ble_status_dz0'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 3, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['ble_status']['ble_status_dz1'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['ble_status']['ble_status_dz1'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['ble_status']['ble_status_dz1'] = "Afuera";
						romper;
					caso 3:
						datos_decodificados['ble_status']['ble_status_dz1'] = "Cerca";
						romper;
					por defecto:
						datos_decodificados['ble_status']['ble_status_dz1'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 5, 4, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['ble_status']['ble_status_dz2'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['ble_status']['ble_status_dz2'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['ble_status']['ble_status_dz2'] = "Afuera";
						romper;
					caso 3:
						datos_decodificados['ble_status']['ble_status_dz2'] = "Cerca";
						romper;
					por defecto:
						datos_decodificados['ble_status']['ble_status_dz2'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 7, 6, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['ble_status']['ble_status_dz3'] = "Desconocido";
						romper;
					caso 1:
						datos_decodificados['ble_status']['ble_status_dz3'] = "Dentro";
						romper;
					caso 2:
						datos_decodificados['ble_status']['ble_status_dz3'] = "Afuera";
						romper;
					caso 3:
						datos_decodificados['ble_status']['ble_status_dz3'] = "Cerca";
						romper;
					por defecto:
						datos_decodificados['ble_status']['ble_status_dz3'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x00, 0x73],
			fn: función(arg) {
				datos_decodificados['presión_barométrica'] = (campo_decodificación(arg, 2, 15, 0, "sin signo") * 0.1).toFixed(1);
				devolver 2;
			}
		},
		{
			clave: [0x00, 0x74],
			fn: función(arg) {
				datos_decodificados['presión_barométrica_cal'] = (campo_decodificación(arg, 2, 15, 0, "sin signo") * 0.1).toFixed(1);
				devolver 2;
			}
		},
		{
			clave: [0x00, 0x71],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('vector_de_aceleración')) {
					datos_decodificados['vector_de_aceleración'] = {};
				}
				datos_decodificados['vector_de_aceleración']['aceleración_x'] = (campo_decodificación(arg, 6, 47, 32, "firmado") * 0.001).toFixed(3);
				datos_decodificados['vector_de_aceleración']['aceleración_y'] = (campo_decodificación(arg, 6, 31, 16, "firmado") * 0.001).toFixed(3);
				datos_decodificados['vector_de_aceleración']['aceleración_z'] = (campo_decodificación(arg, 6, 15, 0, "firmado") * 0.001).toFixed(3);
				devolver 6;
			}
		},
		{
			clave: [0x00, 0x67],
			fn: función(arg) {
				datos_decodificados['temperatura'] = (campo_decodificación(arg, 2, 15, 0, "firmado") * 0.1).toFixed(1);
				devolver 2;
			}
		},
		{
			clave: [0x02, 0x95],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('estado_de_seguridad')) {
					datos_decodificados['estado_de_seguridad'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['safety_status']['safety_status_eb'] = "Inactivo";
						romper;
					caso 1:
						datos_decodificados['estado_de_seguridad']['estado_de_seguridad_eb'] = "Activo";
						romper;
					por defecto:
						datos_decodificados['safety_status']['safety_status_eb'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['safety_status']['safety_status_fall'] = "Caída despejada";
						romper;
					caso 1:
						datos_decodificados['estado_de_seguridad']['estado_de_seguridad_fall'] = "Activo";
						romper;
					por defecto:
						datos_decodificados['safety_status']['safety_status_fall'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 2, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['safety_status']['safety_status_sh'] = "Desactivado";
						romper;
					caso 1:
						datos_decodificados['estado_de_seguridad']['estado_de_seguridad_sh'] = "Activado";
						romper;
					por defecto:
						datos_decodificados['safety_status']['safety_status_sh'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 3, 3, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['safety_status']['safety_status_ear'] = "Inactivo";
						romper;
					caso 1:
						datos_decodificados['estado_de_seguridad']['estado_de_seguridad_ear'] = "Activo";
						romper;
					por defecto:
						datos_decodificados['safety_status']['safety_status_ear'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 4, 4, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['safety_status']['safety_status_pressure'] = "Inactivo";
						romper;
					caso 1:
						datos_decodificados['estado_de_seguridad']['estado_de_seguridad_presión'] = "Activo";
						romper;
					por defecto:
						datos_decodificados['safety_status']['safety_status_pressure'] = "Inválido";
				}}
				devuelve 1;
			}
		},
	];
}
si (entrada.fPort === 25) {
	decodificador = [
		{
			clave: [0x0A],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_1')) {
					datos_decodificados['ble_1'] = {};
				}
					var datos = [];
					var bucle = arg.longitud / 7;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['id_01'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
						grupo['rssi_01'] = campo_decodificación(arg, 7, 7, 0, "firmado");
						datos.push(grupo);
						arg = arg.slice(7);
					}
					datos_decodificados['ble_1'] = datos;
					bucle de retorno*7;
			}
		},
		{
			clave: [0xB0],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_2')) {
					datos_decodificados['ble_2'] = {};
				}
					var datos = [];
					var bucle = arg.longitud / 7;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['id_02'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
						grupo['rssi_02'] = campo_decodificación(arg, 7, 7, 0, "firmado");
						datos.push(grupo);
						arg = arg.slice(7);
					}
					datos_decodificados['ble_2'] = datos;
					bucle de retorno*7;
			}
		},
		{
			clave: [0xB1],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_3')) {
					datos_decodificados['ble_3'] = {};
				}
					var datos = [];
					var bucle = arg.longitud / 7;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['id_03'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
						grupo['rssi_03'] = campo_decodificación(arg, 7, 7, 0, "firmado");
						datos.push(grupo);
						arg = arg.slice(7);
					}
					datos_decodificados['ble_3'] = datos;
					bucle de retorno*7;
			}
		},
		{
			clave: [0xB2],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_4')) {
					datos_decodificados['ble_4'] = {};
				}
					var datos = [];
					var bucle = arg.longitud / 7;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['id_04'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
						grupo['rssi_04'] = campo_decodificación(arg, 7, 7, 0, "firmado");
						datos.push(grupo);
						arg = arg.slice(7);
					}
					datos_decodificados['ble_4'] = datos;
					bucle de retorno*7;
			}
		},
		{
			clave: [0xB3],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_5')) {
					datos_decodificados['ble_5'] = {};
				}
					var datos = [];
					var bucle = arg.longitud / 7;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['id_05'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
						grupo['rssi_05'] = campo_decodificación(arg, 7, 7, 0, "firmado");
						datos.push(grupo);
						arg = arg.slice(7);
					}
					datos_decodificados['ble_5'] = datos;
					bucle de retorno*7;
			}
		},
	];
}
si (entrada.fPort === 100) {
	decodificador = [
		{
			clave: [0x10],
			fn: función(arg) {
				var val = decode_field(arg, 2, 15, 15, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['modo_de_unión'] = "ABP";
						romper;
					caso 1:
						decoded_data['join_mode'] = "OTAA";
						romper;
					por defecto:
						decoded_data['join_mode'] = "Inválido";
				}}
				devolver 2;
			}
		},
		{
			clave: [0x11],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('loramac_opts')) {
					datos_decodificados['loramac_opts'] = {};
				}
				var val = decodificar_campo(arg, 2, 3, 3, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['loramac_opts']['loramac_adr'] = "Deshabilitar";
						romper;
					caso 1:
						decoded_data['loramac_opts']['loramac_adr'] = "Habilitar";
						romper;
					por defecto:
						datos_decodificados['loramac_opts']['loramac_adr'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 2, 2, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['loramac_opts']['loramac_duty_cycle'] = "Deshabilitar";
						romper;
					caso 1:
						datos_decodificados['loramac_opts']['loramac_duty_cycle'] = "Habilitar";
						romper;
					por defecto:
						datos_decodificados['loramac_opts']['loramac_duty_cycle'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 2, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['loramac_opts']['loramac_ul_type'] = "Privado";
						romper;
					caso 1:
						datos_decodificados['loramac_opts']['loramac_ul_type'] = "Público";
						romper;
					por defecto:
						datos_decodificados['loramac_opts']['loramac_ul_type'] = "Inválido";
				}}
				var val = decode_field(arg, 2, 0, 0, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['loramac_opts']['loramac_confirmed'] = "Sin confirmar";
						romper;
					caso 1:
						decoded_data['loramac_opts']['loramac_confirmed'] = "Confirmado";
						romper;
					por defecto:
						datos_decodificados['loramac_opts']['loramac_confirmed'] = "Inválido";
				}}
				devolver 2;
			}
		},
		{
			clave: [0x12],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('loramac_dr_tx')) {
					datos_decodificados['loramac_dr_tx'] = {};
				}
				datos_decodificados['loramac_dr_tx']['loramac_default_dr'] = campo_decodificación(arg, 2, 11, 8, "sin signo");
				datos_decodificados['loramac_dr_tx']['loramac_default_tx_pwr'] = campo_decodificación(arg, 2, 3, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x13],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('loramac_rx2')) {
					datos_decodificados['loramac_rx2'] = {};
				}
				datos_decodificados['loramac_rx2']['loramac_rx2_freq'] = campo_decodificación(arg, 5, 39, 8, "sin signo");
				datos_decodificados['loramac_rx2']['loramac_rx2_dr'] = campo_decodificación(arg, 5, 7, 0, "sin signo");
				devolver 5;
			}
		},
		{
			clave: [0x20],
			fn: función(arg) {
				datos_decodificados['segundos_por_tick_de_núcleo'] = campo_decodificación(arg, 4, 31, 0, "sin signo");
				devolver 4;
			}
		},
		{
			clave: [0x21],
			fn: función(arg) {
				datos_decodificados['batería_ticks'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x22],
			fn: función(arg) {
				datos_decodificados['ticks_normal_state'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x23],
			fn: función(arg) {
				datos_decodificados['ticks_emergency_state'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x24],
			fn: función(arg) {
				datos_decodificados['ticks_accelerómetro'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x25],
			fn: función(arg) {
				datos_decodificados['temperatura_ticks'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x26],
			fn: función(arg) {
				datos_decodificados['ticks_safety_status_normal'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x27],
			fn: función(arg) {
				datos_decodificados['ticks_pressure'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x28],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('eb_active_buzz_config')) {
					datos_decodificados['eb_active_buzz_config'] = {};
				}
				datos_decodificados['eb_active_buzz_config']['eb_buzz_active_on_time'] = (campo_decodificación(arg, 3, 23, 16, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['eb_active_buzz_config']['eb_buzz_active_off_time'] = (campo_decodificación(arg, 3, 15, 8, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['eb_active_buzz_config']['eb_buzz_active_num_on_offs'] = campo_decodificación(arg, 3, 7, 0, "sin signo");
				devolver 3;
			}
		},
		{
			clave: [0x29],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('eb_inactive_buzz_config')) {
					datos_decodificados['eb_inactive_buzz_config'] = {};
				}
				datos_decodificados['eb_inactive_buzz_config']['eb_buzz_inactive_on_time'] = (campo_decodificación(arg, 3, 23, 16, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['eb_inactive_buzz_config']['eb_buzz_inactive_off_time'] = (campo_decodificación(arg, 3, 15, 8, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['eb_inactive_buzz_config']['eb_buzz_inactive_num_on_offs'] = campo_decodificación(arg, 3, 7, 0, "sin signo");
				devolver 3;
			}
		},
		{
			clave: [0x2C],
			fn: función(arg) {
				datos_decodificados['sh_debounce_interval'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x2D],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('sh_buzz_config')) {
					datos_decodificados['sh_buzz_config'] = {};
				}
				datos_decodificados['sh_buzz_config']['sh_buzz_when_to'] = campo_decodificación(arg, 5, 33, 32, "cadena hexadecimal");
				datos_decodificados['sh_buzz_config']['sh_buzz_on_time'] = (campo_decodificación(arg, 5, 31, 24, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['sh_buzz_config']['sh_buzz_off_time'] = (campo_decodificación(arg, 5, 23, 16, "sin signo") * 0.1).toFixed(1);
				datos_decodificados['sh_buzz_config']['sh_buzz_num_on_offs'] = campo_decodificación(arg, 5, 15, 8, "sin signo");
				datos_decodificados['sh_buzz_config']['sh_buzz_period'] = (campo_decodificación(arg, 5, 7, 0, "sin signo") * 0.1).toFixed(1);
				devolver 5;
			}
		},
		{
			clave: [0x30],
			fn: función(arg) {
				var val = decode_field(arg, 1, 7, 7, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['gnss_receiver'] = "Deshabilitado";
						romper;
					caso 1:
						decoded_data['gnss_receiver'] = "Habilitado";
						romper;
					por defecto:
						decoded_data['gnss_receiver'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x31],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('opciones_del_informe_gnss')) {
					datos_decodificados['opciones_del_informe_gnss'] = {};
				}
				var val = decodificar_campo(arg, 1, 2, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_report_options']['gnss_dz_status_report'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_report_options']['gnss_dz_status_report'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_report_options']['gnss_dz_status_report'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_report_options']['gnss_ground_speed_report'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_report_options']['gnss_ground_speed_report'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_report_options']['gnss_ground_speed_report'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 0, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_report_options']['gnss_utc_coordinates_report'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_report_options']['gnss_utc_coordinates_report'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_report_options']['gnss_utc_coordinates_report'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x32],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_dz0')) {
					datos_decodificados['gnss_dz0'] = {};
				}
				datos_decodificados['gnss_dz0']['gnss_dz0_latitud'] = (campo_decodificación(arg, 8, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
				datos_decodificados['gnss_dz0']['gnss_dz0_longitud'] = (campo_decodificación(arg, 8, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
				datos_decodificados['gnss_dz0']['gnss_dz0_radius'] = (campo_decodificación(arg, 8, 15, 0, "firmado") * 10).toFixed(1);
				devolver 8;
			}
		},
		{
			clave: [0x33],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_dz1')) {
					datos_decodificados['gnss_dz1'] = {};
				}
				datos_decodificados['gnss_dz1']['gnss_dz1_latitud'] = (campo_decodificación(arg, 8, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
				datos_decodificados['gnss_dz1']['gnss_dz1_longitud'] = (campo_decodificación(arg, 8, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
				datos_decodificados['gnss_dz1']['gnss_dz1_radius'] = (campo_decodificación(arg, 8, 15, 0, "firmado") * 10).toFixed(1);
				devolver 8;
			}
		},
		{
			clave: [0x34],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_dz2')) {
					datos_decodificados['gnss_dz2'] = {};
				}
				datos_decodificados['gnss_dz2']['gnss_dz2_latitud'] = (campo_decodificación(arg, 8, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
				datos_decodificados['gnss_dz2']['gnss_dz2_longitud'] = (campo_decodificación(arg, 8, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
				datos_decodificados['gnss_dz2']['gnss_dz2_radius'] = (campo_decodificación(arg, 8, 15, 0, "firmado") * 10).toFixed(1);
				devolver 8;
			}
		},
		{
			clave: [0x35],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_dz3')) {
					datos_decodificados['gnss_dz3'] = {};
				}
				datos_decodificados['gnss_dz3']['gnss_dz3_latitud'] = (campo_decodificación(arg, 8, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
				datos_decodificados['gnss_dz3']['gnss_dz3_longitud'] = (campo_decodificación(arg, 8, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
				datos_decodificados['gnss_dz3']['gnss_dz3_radius'] = (campo_decodificación(arg, 8, 15, 0, "firmado") * 10).toFixed(1);
				devolver 8;
			}
		},
		{
			clave: [0x36],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('gnss_diagnostics_tx')) {
					datos_decodificados['gnss_diagnostics_tx'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['num_of_sats'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['num_of_sats'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['num_of_sats'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['avg_sat_snr'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['avg_sat_snr'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['avg_sat_snr'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 2, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['reported_fix_type'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['reported_fix_type'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['reported_fix_type'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 3, 3, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['time_to_reported_fix'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['time_to_reported_fix'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['time_to_reported_fix'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 4, 4, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['fix_log_num'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['fix_log_num'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['fix_log_num'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 5, 5, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['gnss_diagnostics_tx']['fix_acc_and_num_fixes_report'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['gnss_diagnostics_tx']['fix_acc_and_num_fixes_report'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['gnss_diagnostics_tx']['fix_acc_and_num_fixes_report'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x38],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('activador_de_estado_de_emergencia')) {
					datos_decodificados['activador_de_estado_de_emergencia'] = {};
				}
				var val = decodificar_campo(arg, 1, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 0, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x39],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('emergency_state_led_config')) {
					datos_decodificados['emergency_state_led_config'] = {};
				}
				datos_decodificados['configuración_led_de_estado_de_emergencia']['tiempo_de_encendido_led_de_emergencia'] = (campo_decodificación(arg, 4, 31, 24, "sin signo") * 0.01).toFixed(2);
				datos_decodificados['configuración_led_de_estado_de_emergencia']['tiempo_apagado_led_de_emergencia'] = (campo_decodificación(arg, 4, 23, 16, "sin signo") * 0.01).toFixed(2);
				datos_decodificados['configuración_led_de_estado_de_emergencia']['número_de_led_de_emergencia_encendidos_apagados'] = campo_decodificación(arg, 4, 15, 8, "sin signo");
				datos_decodificados['configuración_led_de_estado_de_emergencia']['periodo_led_de_emergencia'] = (campo_decodificación(arg, 4, 7, 0, "sin signo") * 0.1).toFixed(1);
				devolver 4;
			}
		},
		{
			clave: [0x3B],
			fn: función(arg) {
				datos_decodificados['muestra_de_presión_de_segundos'] = campo_decodificación(arg, 1, 5, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x3C],
			fn: función(arg) {
				var val = decode_field(arg, 2, 15, 0, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['calibration_reference_pressure'] = "Deshabilitado";
						romper;
					caso 1:
						decoded_data['calibration_reference_pressure'] = "Habilitado";
						romper;
					por defecto:
						decoded_data['calibration_reference_pressure'] = "Inválido";
				}}
				devolver 2;
			}
		},
		{
			clave: [0x3D],
			fn: función(arg) {
				datos_decodificados['umbral_de_presión_máxima'] = campo_decodificación(arg, 4, 31, 16, "sin signo");
				datos_decodificados['umbral_de_presión_mín'] = campo_decodificación(arg, 4, 15, 0, "sin signo");
				devolver 4;
			}
		},
		{
			clave: [0x41],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('sensibilidad_del_acelerómetro')) {
					datos_decodificados['sensibilidad_del_acelerómetro'] = {};
				}
				var val = decode_field(arg, 1, 5, 4, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['sensibilidad_del_acelerómetro']['rango_de_medición_del_acelerómetro'] = "+/-2g";
						romper;
					caso 1:
						datos_decodificados['sensibilidad_del_acelerómetro']['rango_de_medición_del_acelerómetro'] = "+/-4 g";
						romper;
					caso 2:
						datos_decodificados['sensibilidad_del_acelerómetro']['rango_de_medición_del_acelerómetro'] = "+/-8 g";
						romper;
					caso 3:
						datos_decodificados['sensibilidad_del_acelerómetro']['rango_de_medición_del_acelerómetro'] = "+/-6 g";
						romper;
					por defecto:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 2, 0, "sin signo");
				{cambiar (val){
					caso 1:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "1 Hz";
						romper;
					caso 2:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "10 Hz";
						romper;
					caso 3:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "25 Hz";
						romper;
					caso 4:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "50 Hz";
						romper;
					caso 5:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "100 Hz";
						romper;
					caso 6:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "200 Hz";
						romper;
					caso 7:
						datos_decodificados['sensibilidad_del_acelerómetro']['frecuencia_de_muestreo_del_acelerómetro'] = "400 Hz";
						romper;
					por defecto:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x42],
			fn: función(arg) {
				datos_decodificados['umbral_de_aceleración_del_sueño'] = (campo_decodificación(arg, 2, 15, 0, "sin signo") * 0.001).toFixed(3);
				devolver 2;
			}
		},
		{
			clave: [0x43],
			fn: función(arg) {
				datos_decodificados['tiempo_de_espera_para_dormir'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x48],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('caída_libre')) {
					datos_decodificados['caída_libre'] = {};
				}
				datos_decodificados['caída_libre']['umbral_de_aceleración_de_caída_libre'] = (campo_decodificación(arg, 4, 31, 16, "sin signo") * 0.001).toFixed(3);
				datos_decodificados['caída_libre']['intervalo_de_aceleración_de_caída_libre'] = (campo_decodificación(arg, 4, 15, 0, "sin signo") * 0.001).toFixed(3);
				devolver 4;
			}
		},
		{
			clave: [0x49],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('impacto')) {
					datos_decodificados['impacto'] = {};
				}
				datos_decodificados['impacto']['umbral_de_impacto'] = (campo_decodificación(arg, 4, 31, 16, "sin signo") * 0.001).toFixed(3);
				datos_decodificados['impacto']['duración_del_apagón_del_impacto'] = (campo_decodificación(arg, 4, 15, 0, "sin signo") * 0.001).toFixed(3);
				devolver 4;
			}
		},
		{
			clave: [0x4A],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('torpidez')) {
					datos_decodificados['torpidez'] = {};
				}
				datos_decodificados['torpeza']['umbral_de_torpeza'] = (campo_decodificación(arg, 3, 23, 8, "sin signo") * 0.001).toFixed(3);
				datos_decodificados['torpidez']['intervalo_de_torpidez'] = (campo_decodificación(arg, 3, 7, 0, "sin signo") * 0.001).toFixed(3);
				devolver 3;
			}
		},
		{
			clave: [0x50],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_mode')) {
					datos_decodificados['ble_mode'] = {};
				}
				var val = decode_field(arg, 1, 7, 7, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['ble_mode']['ble_avg_mode'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['ble_mode']['ble_avg_mode'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['ble_mode']['ble_avg_mode'] = "Inválido";
				}}
				var val = decode_field(arg, 1, 6, 6, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['ble_mode']['ble_dz_status_report'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['ble_mode']['ble_dz_status_report'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['ble_mode']['ble_dz_status_report'] = "Inválido";
				}}
				datos_decodificados['ble_mode']['ble_num_reported_devices'] = campo_decodificación(arg, 1, 5, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x51],
			fn: función(arg) {
				datos_decodificados['ble_scan_duration_periodic'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x52],
			fn: función(arg) {
				datos_decodificados['ble_scan_interval'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x53],
			fn: función(arg) {
				datos_decodificados['ble_scan_window'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x54],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_range0')) {
					datos_decodificados['ble_range0'] = {};
				}
				datos_decodificados['ble_range0']['ble_range0_bd_addr_oui'] = campo_decodificación(arg, 9, 71, 48, "cadena hexadecimal");
				datos_decodificados['ble_range0']['ble_range0_bd_addr_start'] = campo_decodificación(arg, 9, 47, 24, "cadena hexadecimal");
				datos_decodificados['ble_range0']['ble_range0_bd_addr_end'] = campo_decodificación(arg, 9, 23, 0, "cadena hexadecimal");
				devolver 9;
			}
		},
		{
			clave: [0x55],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_range1')) {
					datos_decodificados['ble_range1'] = {};
				}
				datos_decodificados['ble_range1']['ble_range1_bd_addr_oui'] = campo_decodificación(arg, 9, 71, 48, "cadena hexadecimal");
				datos_decodificados['ble_range1']['ble_range1_bd_addr_start'] = campo_decodificación(arg, 9, 47, 24, "cadena hexadecimal");
				datos_decodificados['ble_range1']['ble_range1_bd_addr_end'] = campo_decodificación(arg, 9, 23, 0, "cadena hexadecimal");
				devolver 9;
			}
		},
		{
			clave: [0x56],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_range2')) {
					datos_decodificados['ble_range2'] = {};
				}
				datos_decodificados['ble_range2']['ble_range2_bd_addr_oui'] = campo_decodificación(arg, 9, 71, 48, "cadena hexadecimal");
				datos_decodificados['ble_range2']['ble_range2_bd_addr_start'] = campo_decodificación(arg, 9, 47, 24, "cadena hexadecimal");
				datos_decodificados['ble_range2']['ble_range2_bd_addr_end'] = campo_decodificación(arg, 9, 23, 0, "cadena hexadecimal");
				devolver 9;
			}
		},
		{
			clave: [0x57],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_range3')) {
					datos_decodificados['ble_range3'] = {};
				}
				datos_decodificados['ble_range3']['ble_range3_bd_addr_oui'] = campo_decodificación(arg, 9, 71, 48, "cadena hexadecimal");
				datos_decodificados['ble_range3']['ble_range3_bd_addr_start'] = campo_decodificación(arg, 9, 47, 24, "cadena hexadecimal");
				datos_decodificados['ble_range3']['ble_range3_bd_addr_end'] = campo_decodificación(arg, 9, 23, 0, "cadena hexadecimal");
				devolver 9;
			}
		},
		{
			clave: [0x58],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_dz0')) {
					datos_decodificados['ble_dz0'] = {};
				}
				datos_decodificados['ble_dz0']['ble_dz0_bd_addr'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
				datos_decodificados['ble_dz0']['ble_dz0_rssi'] = campo_decodificación(arg, 7, 7, 0, "firmado");
				devolver 7;
			}
		},
		{
			clave: [0x59],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_dz1')) {
					datos_decodificados['ble_dz1'] = {};
				}
				datos_decodificados['ble_dz1']['ble_dz1_bd_addr'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
				datos_decodificados['ble_dz1']['ble_dz1_rssi'] = campo_decodificación(arg, 7, 7, 0, "firmado");
				devolver 7;
			}
		},
		{
			clave: [0x5A],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_dz2')) {
					datos_decodificados['ble_dz2'] = {};
				}
				datos_decodificados['ble_dz2']['ble_dz2_bd_addr'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
				datos_decodificados['ble_dz2']['ble_dz2_rssi'] = campo_decodificación(arg, 7, 7, 0, "firmado");
				devolver 7;
			}
		},
		{
			clave: [0x5B],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('ble_dz3')) {
					datos_decodificados['ble_dz3'] = {};
				}
				datos_decodificados['ble_dz3']['ble_dz3_bd_addr'] = campo_decodificación(arg, 7, 55, 8, "cadena hexadecimal");
				datos_decodificados['ble_dz3']['ble_dz3_rssi'] = campo_decodificación(arg, 7, 7, 0, "firmado");
				devolver 7;
			}
		},
		{
			clave: [0x68],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('opciones_del_informe_de_batería')) {
					datos_decodificados['opciones_del_informe_de_batería'] = {};
				}
				var val = decodificar_campo(arg, 1, 2, 2, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_vida_de_la_batería'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_vida_de_la_batería'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_vida_de_la_batería'] = "Inválido";
				}}
				var val = decodificar_campo(arg, 1, 1, 1, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_tiempo_de_vida_de_la_batería'] = "Deshabilitado";
						romper;
					caso 1:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_tiempo_de_vida_de_la_batería'] = "Habilitado";
						romper;
					por defecto:
						datos_decodificados['opciones_del_informe_de_batería']['informe_de_tiempo_de_vida_de_la_batería'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x69],
			fn: función(arg) {
				if(!decoded_data.hasOwnProperty('umbral_de_batería_baja')) {
					datos_decodificados['umbral_de_batería_baja'] = {};
				}
				var val = decode_field(arg, 2, 15, 14, "sin signo");
				{cambiar (val){
					caso 1:
						decoded_data['low_battery_threshold']['low_battery_threshold_type'] = "Porcentaje";
						romper;
					caso 2:
						datos_decodificados['umbral_de_batería_bajo']['tipo_umbral_de_batería_bajo'] = "Días";
						romper;
					por defecto:
						datos_decodificados['umbral_de_batería_baja']['tipo_de_umbral_de_batería_baja'] = "Inválido";
				}}
				datos_decodificados['umbral_de_batería_baja']['valor_del_umbral_de_batería_baja'] = campo_decodificación(arg, 2, 13, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x6A],
			fn: función(arg) {
				if(!datos_decodificados.hasOwnProperty('configuración_led_batería_baja')) {
					datos_decodificados['configuración_led_batería_baja'] = {};
				}
				datos_decodificados['configuración_led_batería_baja']['tiempo_encendido_led_batería_baja'] = (campo_decodificación(arg, 4, 31, 24, "sin signo") * 0.01).toFixed(2);
				datos_decodificados['configuración_led_batería_baja']['tiempo_apagado_led_batería_baja'] = (campo_decodificación(arg, 4, 23, 16, "sin signo") * 0.01).toFixed(2);
				datos_decodificados['configuración_led_batería_baja']['número_de_leds_encendidos_apagados_baja'] = campo_decodificación(arg, 4, 15, 8, "sin signo");
				datos_decodificados['configuración_led_batería_baja']['periodo_led_batería_baja'] = campo_decodificación(arg, 4, 7, 0, "sin signo");
				devolver 4;
			}
		},
		{
			clave: [0x6B],
			fn: función(arg) {
				datos_decodificados['ventana_de_tendencia_de_energía_promedio'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x6C],
			fn: función(arg) {
				datos_decodificados['buzzer_disable_timeout'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x6F],
			fn: función(arg) {
				datos_decodificados['resp_format'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x71],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('metadatos')) {
					datos_decodificados['metadatos'] = {};
				}
				datos_decodificados['metadatos']['app_ver_major'] = campo_decodificación(arg, 7, 55, 48, "sin signo");
				datos_decodificados['metadatos']['versión_aplicación_menor'] = campo_decodificación(arg, 7, 47, 40, "sin signo");
				datos_decodificados['metadatos']['revisión_de_versión_de_la_aplicación'] = campo_decodificación(arg, 7, 39, 32, "sin signo");
				datos_decodificados['metadatos']['loramac_ver_major'] = campo_decodificación(arg, 7, 31, 24, "sin signo");
				datos_decodificados['metadatos']['loramac_ver_minor'] = campo_decodificación(arg, 7, 23, 16, "sin signo");
				datos_decodificados['metadatos']['loramac_ver_revision'] = campo_decodificación(arg, 7, 15, 8, "sin signo");
				var val = decode_field(arg, 7, 7, 0, "sin signo");
				{cambiar (val){
					caso 0:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "EU868";
						romper;
					caso 1:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "US916";
						romper;
					caso 2:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "AS923";
						romper;
					caso 3:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "AU915";
						romper;
					caso 4:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "IN865";
						romper;
					caso 5:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "CN470";
						romper;
					caso 6:
						datos_decodificados['metadatos']['lorawan_region_id'] = "KR920";
						romper;
					caso 7:
						datos_decodificados['metadatos']['id_de_región_lorawan'] = "RU864";
						romper;
					por defecto:
						datos_decodificados['metadata']['lorawan_region_id'] = "Inválido";
				}}
				devolver 7;
			}
		},
	];
}
si (entrada.fPuerto === 16) {
	decodificador = [
		{
			clave: [0x0D, 0x3C],
			fn: función(arg) {
				datos_decodificados['num_satélites'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x0D, 0x64],
			fn: función(arg) {
				datos_decodificados['avg_satellite_snr'] = campo_decodificación(arg, 2, 15, 0, "sin signo") * 0.1;
				devolver 2;
			}
		},
		{
			clave: [0x0D, 0x95],
			fn: función(arg) {
				var val = decode_field(arg, 1, 1, 0, "sin signo");
				{cambiar (val){
					caso 0:
						decoded_data['fix_type'] = "No hay solución disponible";
						romper;
					caso 2:
						decoded_data['fix_type'] = "Corrección 2D";
						romper;
					caso 3:
						decoded_data['fix_type'] = "Corrección 3D";
						romper;
					por defecto:
						decoded_data['fix_type'] = "Inválido";
				}}
				devuelve 1;
			}
		},
		{
			clave: [0x0D, 0x96],
			fn: función(arg) {
				datos_decodificados['tiempo_para_arreglar'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
		{
			clave: [0x0D, 0x97],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('corregir_precisión')) {
					datos_decodificados['corregir_precisión'] = {};
				}
				datos_decodificados['corregir_precisión']['precisión_vertical_gnss'] = (campo_decodificación(arg, 4, 31, 16, "sin signo")).toFixed(2);
				datos_decodificados['corregir_precisión']['precisión_horizontal_gnss'] = (campo_decodificación(arg, 4, 15, 0, "sin signo")).toFixed(2);
				devolver 4;
			}
		},
		{
			clave: [0x0D, 0x98],
			fn: función(arg) {
				datos_decodificados['precisión_de_velocidad_superficial'] = (campo_decodificación(arg, 4, 31, 0, "sin signo") * 0.001).toFixed(3);
				devolver 4;
			}
		},
		{
			clave: [0x0D, 0x99],
			fn: función(arg) {
				datos_decodificados['num_of_fixes'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x0D, 0x0F],
			fn: función(arg) {
				datos_decodificados['log_num'] = campo_decodificación(arg, 2, 15, 0, "sin signo");
				devolver 2;
			}
		},
	];
}
si (entrada.fPort === 15) {
	decodificador = [
		{
			clave: [0x0A],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('solicitud_de_registro_utc_tipo_a')) {
					datos_decodificados['log_request_utc_type_a'] = {};
				}
				datos_decodificados['log_request_utc_type_a']['año_0a'] = campo_decodificación(arg, 5, 39, 34, "sin signo");
				datos_decodificados['log_request_utc_type_a']['month_0a'] = campo_decodificación(arg, 5, 33, 30, "sin signo");
				datos_decodificados['log_request_utc_type_a']['day_0a'] = campo_decodificación(arg, 5, 29, 25, "sin signo");
				datos_decodificados['log_request_utc_type_a']['hora_0a'] = campo_decodificación(arg, 5, 24, 20, "sin signo");
				datos_decodificados['log_request_utc_type_a']['minuto_0a'] = campo_decodificación(arg, 5, 19, 14, "sin signo");
				datos_decodificados['log_request_utc_type_a']['second_0a'] = campo_decodificación(arg, 5, 13, 8, "sin signo");
				datos_decodificados['log_request_utc_type_a']['number_0a'] = campo_decodificación(arg, 5, 7, 0, "sin signo");
				devolver 5;
			}
		},
		{
			clave: [0x0B],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('solicitud_de_registro_utc_tipo_b')) {
					datos_decodificados['log_request_utc_type_b'] = {};
				}
				datos_decodificados['log_request_utc_type_b']['number_0b'] = campo_decodificación(arg, 1, 7, 0, "sin signo");
				devuelve 1;
			}
		},
		{
			clave: [0x01],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('log_utc')) {
					datos_decodificados['log_utc'] = {};
				}
				datos_decodificados['log_utc']['fragmento_número_1'] = campo_decodificación(arg, 5, 39, 32, "sin signo");
				datos_decodificados['log_utc']['año_1'] = campo_decodificación(arg, 5, 31, 26, "sin signo");
				datos_decodificados['log_utc']['mes_1'] = campo_decodificación(arg, 5, 25, 22, "sin signo");
				datos_decodificados['log_utc']['día_1'] = campo_decodificación(arg, 5, 21, 17, "sin signo");
				datos_decodificados['log_utc']['hora_1'] = campo_decodificación(arg, 5, 16, 12, "sin signo");
				datos_decodificados['log_utc']['minuto_1'] = campo_decodificación(arg, 5, 11, 6, "sin signo");
				datos_decodificados['log_utc']['segundo_1'] = campo_decodificación(arg, 5, 5, 0, "sin signo");
				devolver 5;
			}
		},
		{
			clave: [0x02],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('coordenadas_del_registro')) {
					datos_decodificados['coordenadas_registradas'] = {};
				}
				datos_decodificados['coordenadas_de_registro']['número_de_fragmento_2'] = campo_decodificación(arg, 9, 71, 64, "sin signo");
				datos_decodificados['coordenadas_registradas']['latitud_2'] = (campo_decodificado(arg, 9, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
				datos_decodificados['coordenadas_registradas']['longitud_2'] = (campo_decodificación(arg, 9, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
				datos_decodificados['coordenadas_registradas']['altitud_2'] = (campo_decodificación(arg, 9, 15, 0, "firmado") * 0.144958496 + -500).toFixed(3);
				devolver 9;
			}
		},
		{
			clave: [0x03],
			fn: función(arg) {
				si(!datos_decodificados.hasOwnProperty('log_all')) {
					datos_decodificados['log_all'] = {};
				}
					arg = arg.slice(1)
					var datos = [];
					var bucle = arg.longitud / 12;
					para (var i = 0; i < bucle; i++) {
						var grupo = {};
						grupo['año_3'] = campo_decodificación(arg, 12, 95, 90, "sin signo");
						grupo['mes_3'] = campo_decodificación(arg, 12, 89, 86, "sin signo");
						grupo['día_3'] = campo_decodificación(arg, 12, 85, 81, "sin signo");
						grupo['hora_3'] = campo_decodificación(arg, 12, 80, 76, "sin signo");
						grupo['minuto_3'] = campo_decodificación(arg, 12, 75, 70, "sin signo");
						grupo['segundo_3'] = campo_decodificación(arg, 12, 69, 64, "sin signo");
						grupo['latitud_3'] = (campo_decodificación(arg, 12, 63, 40, "firmado") * 0.00001072883606).toFixed(7);
						grupo['longitud_3'] = (campo_decodificación(arg, 12, 39, 16, "firmado") * 0.00002145767212).toFixed(7);
						grupo['altitud_3'] = (campo_decodificación(arg, 12, 15, 0, "firmado") * 0.144958496 + -500).toFixed(3);
						datos.push(grupo);
						arg = arg.slice(12);
					}
					datos_decodificados['log_all'] = datos;
					bucle de retorno*12;
			}
		},
	];
}

	intentar {
		para (var bytes_left = bytes.length; bytes_left > 0;) {
			var encontrado = falso;
			para (var i = 0; i < longitud del decodificador; i++) {
				var item = decodificador[i];
				var clave = elemento.clave;
				var keylen = clave.longitud;
				encabezado var = segmento (bytes, 0, keylen);
				if (is_equal(header, key)) { // El encabezado en los datos coincide con lo que esperamos
					var f = elemento.fn;
					var consumido = f(slice(bytes, keylen, bytes.length)) + keylen;
					bytes_left -= consumidos;
					bytes = slice(bytes, consumido, bytes.longitud);
					encontrado = verdadero;
					romper;
				}
			}
			si (!encontrado) {
				errors.push("No se puede decodificar el encabezado " + toHexString(header).toUpperCase());
				romper;
			}
		}
	} captura (error) {
		errors = "Error fatal del decodificador";
	}

	función slice(a, f, t) {
		var res = [];
		para (var i = 0; i < t - f; i++) {
			res[i] = a[f + i];
		}
		devolver res;
	}

	// Extrae bits de una matriz de bytes
	función extract_bytes(fragmento, bit de inicio, bit de fin) {
		var matriz = nueva Matriz(0);
		var totalBits = bit inicial - bit final + 1;
		var totalBytes = Math.ceil(totalBits / 8);
		var endBits = 0;
		var bits de inicio = 0;
		para (var i = 0; i < totalBytes; i++) {
			si(totalBits > 8) {
				endBits = bit final;
				bits de inicio = bits de fin + 7;
				bit final = bit final + 8;
				totalBits -= 8;
			} demás {
				endBits = bit final;
				bits de inicio = bits finales + bits totales - 1;
				totalBits = 0;
			}
			var endChunk = chunk.length - Math.ceil((endBits + 1) / 8);
			var startChunk = chunk.length - Math.ceil((startBits + 1) / 8);
			var palabra = 0x0;
			si (startChunk == endChunk){
				var endOffset = endBits % 8;
				var inicioOffset = inicioBits % 8;
				máscara var = 0xFF >> (8 - (startOffset - endOffset + 1));
				palabra = (fragmento[startChunk] >> endOffset) & máscara;
				matriz.unshift(palabra);
			} demás {
				var endChunkEndOffset = endBits % 8;
				var endChunkStartOffset = 7;
				var endChunkMask = 0xFF >> (8 - (endChunkStartOffset - endChunkEndOffset + 1));
				var endChunkWord = (chunk[endChunk] >> endChunkEndOffset) & endChunkMask;
				var startChunkEndOffset = 0;
				var startChunkStartOffset = inicioBits % 8;
				var startChunkMask = 0xFF >> (8 - (startChunkStartOffset - startChunkEndOffset + 1));
				var startChunkWord = (chunk[startChunk] >> startChunkEndOffset) & startChunkMask;
				var startChunkWordShifted = startChunkWord << (endChunkStartOffset - endChunkEndOffset + 1);
				palabra = finTrozoDePalabra | inicioTrozoDePalabraDesplazado;
				matriz.unshift(palabra);
			}
		}
		devolver matriz;
	}

	// Aplica el tipo de datos a una matriz de bytes
	función aplicar_tipo_de_datos(bytes, tipo_de_datos) {
		var salida = 0;
		si (tipo_de_datos === "sin signo") {
			para (var i = 0; i < bytes.length; ++i) {
				salida = (to_uint(salida << 8)) | bytes[i];
			}
			salida de retorno;
		}
		si (tipo_de_datos === "firmado") {
			para (var i = 0; i < bytes.length; ++i) {
				salida = (salida << 8) | bytes[i];
			}
			// Convertir a firmado, según el tamaño del valor
			si (salida > Math.pow(2, 8 * bytes.length - 1)) {
				salida -= Math.pow(2, 8 * bytes.length);
			}
			salida de retorno;
		}
		si (tipo_de_datos === "bool") {
			devuelve !(bytes[0] === 0);
		}
		si (tipo_de_datos === "cadena_hexadecimal") {
			volver aHexString(bytes);
		}
		devolver nulo; // Tipo de datos incorrecto
	}

	// Decodifica el campo de bits del fragmento de bytes dado
	función decodificar_campo(fragmento, tamaño, bit_inicial, bit_final, tipo_de_datos) {
		var new_chunk = chunk.slice(0, tamaño);
		var chunk_size = nuevo_chunk.length;
		si (bit_de_inicio >= tamaño_del_fragmento * 8) {
			devolver nulo; // Error: se excedieron los límites del fragmento
		}
		si (bit_inicio < bit_final) {
			devolver nulo; // Error: entrada no válida
		}
		var array = extract_bytes(nuevo_fragmento, bit_inicial, bit_final);
		devolver aplicar_tipo_de_datos(matriz, tipo_de_datos);
	}

	// Convierte el valor a sin signo
	función to_uint(x) {
		devolver x >>> 0;
	}

	// Comprueba si dos matrices son iguales
	función es_igual(arr1, arr2) {
		si (arr1.longitud != arr2.longitud) {
			devuelve falso;
		}
		para (var i = 0; i != arr1.length; i++) {
			si (arr1[i] != arr2[i]) {
				devuelve falso;
			}
		}
		devuelve verdadero;
	}

	// Convierte una matriz de bytes en una cadena hexadecimal
	función toHexString(byteArray) {
		var arr = [];
		para (var i = 0; i < byteArray.length; ++i) {
			arr.push(('0' + (byteArray[i] & 0xFF).toString(16)).slice(-2));
		}
		devolver arr.join(' ');
	}

    // Convierte una matriz de bytes en una matriz de 8 bits
    función convertToUint8Array(byteArray) {
		var arr = [];
		para (var i = 0; i < byteArray.length; i++) {
			arr.push(to_uint(byteArray[i]) & 0xff);
		}
		retorno arr;
	}

    var salida = {
        "datos": datos_decodificados,
		"errores": errores,
		"advertencias": [],
    };

    salida de retorno;
}

app.post('/api/datos-del-sensor', (req, res) => {
  constante cuerpo = req.cuerpo;
  constante payload = cuerpo.payload;
  constante deviceMetaData = cuerpo.payloadMetaData?.deviceMetaData || {};

  // Procesar bytes
  deje bytes = carga útil.bytes;
  si (tipo de bytes === 'cadena') {
    intentar {
      bytes = JSON.parse(bytes);
    } captura (e) {
      return res.status(400).send('Formato de cadena de bytes inválido');
    }
  }
  const convertBytes = bytes.map(b => (b < 0 ? b + 256 : b));
  const decodedData = decodeUplink({ bytes: convertBytes, fPort: payload.port });

  latestSensorData = decodedData.data;

  const deviceEUI = deviceMetaData.deviceEUI || 'dispositivo_desconocido';
  constante deviceName = deviceMetaData.name || `ID: ${deviceEUI}`;

  si (!allSensorsData[dispositivoEUI]) allSensorsData[dispositivoEUI] = {};
  allSensorsData[deviceEUI].name = nombreDeDispositivo;
  Objeto.assign(allSensorsData[dispositivoEUI], decodedData.data);

  si (decodedData.data.acceleration_vector) {
    allSensorsData[dispositivoEUI].vector_de_aceleración = {
      ...allSensorsData[dispositivoEUI].vector_de_aceleración,
      ...decodedData.data.acceleration_vector
    };
  }
  si (decodedData.data.safety_status) {
    allSensorsData[dispositivoEUI].estado_de_seguridad = {
      ...allSensorsData[dispositivoEUI].estado_de_seguridad,
      ...decodedData.data.safety_status
    };
  }
  si (decodedData.data.coordinates) {
    allSensorsData[dispositivoEUI].coordenadas = {
      ...allSensorsData[dispositivoEUI].coordenadas,
      ...datos decodificados.datos.coordenadas
    };
  }

  res.status(200).send('OK');
});

app.get('/api/obtener-todos-los-sensores', (req, res) => {
  res.json(todosLosSensoresDatos);
});

aplicación.use(express.static(path.join(__dirname, 'público')));

aplicación.listen(PUERTO, () => {
  console.log(`Servidor de backend escuchando en http://localhost:${PORT}`);
});
