Frontend de Sistema de reportes valle del sol.


Flujo:

1) Backend (Node.js + Express) 

Auth Service, User Service, Report Service, Notification Service, Agent.api
 

2) Capa de api

Auth.api - User.api - client.api - notification.api - report.api - agent.api



3) Hooks

useAuth, useReports, useUserProfile, useAgent, useLocation, usePolling, 



4) Context (Estado global compartido)

AuthContext (User, SaveSession, clearSession )  * ThemeContext


5) Paginas (src/pages) --Solo renderizan 😶‍🌫️😶

LoginPage, DashBoardPage, MapPage, AdminPage, ProfilePage etc


6) Componentes UI (src/Components)

Navbar -  FireAgentPanel etc....


**Exception** AdminHomePage llama APis directo (sin hook)
Por que los datos no se reusan en otro componente







***TIPS PARA ENTENDER ***

En primer lugar ya sabemos el flujo ahora entonces



UseState = Memoria del componente
Con esto guardamos un valor, cuando cambia lo renderiza
Ejemplos: Lista de reporte, loading, error



UseEffect = Reacciona a algo
Corre codigo despues del render
[] = solo al montar, [dep] = cuando dep cambia 
Ejemplos: LLamar API al cargar pagina

UseContext = Lee datos globales, lo que un provider comparte
No mueve datos solo los lee
Ejemplos: user, tema claro/oscuro

UseRef = Valor invisible para React, persiste entre render pero cambiar .current no re-renderiza 
Ejemplos: intervalid, Set de IDs vistas




Una vez sabido esto 😎

En nuestro proyecto se utiliza asi


UseState - estado local
Vive en el componente y muere en el 

Lo ocupamos en:
-reports, users, brigadas (AdminPage)
-pending, form, submitting (MapPage)
-Loading, error (Todos los hooks)
-MenuAbierto [Navbar]


UseContext - estado global
Vive en el provider, Cualquiera lo lee

Lo ocupamos en:

user, saveSession, clearSession
(AuthContext) 
theme, toggleTheme
(ThemeContext)




UseRef - invisible para react
Persiste no renderiza

-IntervalRef (useLocation - ID del poll)
-watchRef (useLocation - GPS watch)
-prevAlertids (useLocation)
-callbacjRef (usePolling -fn fresca)


localStore - Persiste real
Sobrevive al recargar la pagina

-token
-users
-Se escribe en saveSession()
-Se borra en clearSession()



Cuando el componente se desmonta

useState -> Muere
UseContext -> Sobrevive
UseRef -> Muere
localStore -> Sobrevive




Preguntas:

¿Como se autenticacion el sistema?

El usuario ingresa con credenciales en LoginPage. El hook useAuth llama a auth.api, que manda un POST al backend, el backend devuelve un JWT se decofica ese token con atob, se estrae el id, emaily rol, eso se guarda con saveSession en localStore y en authContext, Desde aqui la web sabe quien eres

¿Cómo se controla que un usuario normal no entre al panel de admin?

En App.jsx tengo dos guardas. ProtectedRoute verifica que exista un usuario en el contexto; si no, redirige a login. AdminRoute va un paso más: verifica que user.role === admin; si no, redirige a home. Así un ciudadano común nunca puede llegar a las rutas de administración aunque escriba la URL a mano.

¿Qué pasa cuando un ciudadano reporta un incendio desde el mapa?

El usuario hace click en el mapa. ClickHandler captura las coordenadas y las guarda en el estado pending. Eso abre un formulario superpuesto donde elige el tipo de emergencia y escribe el título. Al enviar, handleSubmit llama a addReport del hook useReports, que hace el POST al backend y agrega el nuevo reporte al estado local con prev =>. El marker aparece en el mapa inmediatamente sin recargar la página.

¿Cómo sabe el mapa que llegó una brigada?

usePolling ejecuta fetchBrigades cada 60 segundos en segundo plano. Cuando una brigada responde un reporte, el backend registra su ubicación. El próximo poll trae esa información y actualiza activeBrigades. En el Popup del reporte aparece automáticamente el nombre de la brigada y su estado. El usuario no necesita recargar nada.

¿Cómo sabe el sistema dónde está el usuario en todo momento?

useLocation usa la API nativa del navegador watchPosition, que escucha cambios de GPS en tiempo real. Cada vez que detecta una nueva posición, actualiza el estado userLocation y hace un POST al backend con las coordenadas. Así el sistema de notificaciones puede calcular qué alertas están cerca de ese usuario usando distancia Haversine

¿Qué muestra el dashboard de administrador?

AdminHomePage hace cuatro llamadas en paralelo con Promise.allSettled al montar: reportes, usuarios, brigadas y alertas. Los guarda en estado y calcula métricas derivadas con .filter y .map: incendios activos, alertas pendientes, brigadas operativas. Esos números alimentan StatCard, un BarChart por tipo de incendio, barras de estado y una tabla con los últimos 5 reportes.

