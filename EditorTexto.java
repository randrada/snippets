/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package tarea7;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Event;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JTextArea;
import javax.swing.JToolBar;
import javax.swing.KeyStroke;
import javax.swing.filechooser.FileFilter;

/**
 *
 * @author Administrador
 */
public class Tarea7 extends JFrame {
    
    JMenuBar barra;
    JMenu subMenuArchivo, subMenuEditar;
    JMenuItem itemMenuNuevo, itemMenuAbrir, itemMenuGuardar, itemMenuGuardarComo, itemMenuCerrarArchivo, itemMenuSalir, itemMenuCortar, itemMenuCopiar, itemMenuPegar;
    JCheckBoxMenuItem itemMenuMostrarBarra;
    JScrollPane areaScroll;
    JTextArea areaTexto;
    
    JToolBar barraIconos;
    JButton botonNuevo, botonAbrir, botonGuardar, botonCortar, botonCopiar, botonPegar;
    
    boolean desdeArchivo;
    File fichero;
    
    String textoOriginal;
    String textoAGuardar;
    
    FileFilter filtroArchivosTexto;
    
    Tarea7() {
        filtroArchivosTexto = new FileFilter() {
            @Override
            public String getDescription() {
                return "Archivos de texto plano (*.txt)";
            }

            @Override
            public boolean accept(File f) {
                if (f.isDirectory()) {
                    return true;
                } else {
                    String filename = f.getName().toLowerCase();
                    return filename.endsWith(".txt");
                }
            }
        };
        
        desdeArchivo = false;
        
        setSize(800, 600);
        setTitle("Editor simple de textos");
        setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);
        this.setLayout(new BorderLayout());
        
        barra = new JMenuBar();
        
        subMenuArchivo = new JMenu("Archivo");
        subMenuEditar = new JMenu("Editar");
        
        subMenuArchivo.setMnemonic('A');
        subMenuEditar.setMnemonic('E');
        
        itemMenuNuevo = new JMenuItem("Nuevo");
        itemMenuAbrir = new JMenuItem("Abrir");
        itemMenuGuardar = new JMenuItem("Guardar");
        itemMenuGuardarComo = new JMenuItem("Guardar como");
        itemMenuCerrarArchivo = new JMenuItem("Cerrar archivo");
        itemMenuMostrarBarra = new JCheckBoxMenuItem("Barra de iconos", false);
        itemMenuSalir = new JMenuItem("Salir");
        
        subMenuArchivo.add(itemMenuNuevo);
        subMenuArchivo.add(itemMenuAbrir);
        subMenuArchivo.add(itemMenuGuardar);
        subMenuArchivo.add(itemMenuGuardarComo);
        subMenuArchivo.add(itemMenuCerrarArchivo);
        subMenuArchivo.add(new JSeparator());
        subMenuArchivo.add(itemMenuMostrarBarra);
        subMenuArchivo.add(new JSeparator());
        subMenuArchivo.add(itemMenuSalir);
        
        itemMenuNuevo.addActionListener(new NuevoOyente());
        itemMenuAbrir.addActionListener(new AbrirOyente());
        itemMenuGuardar.addActionListener(new GuardarOyente());
        itemMenuGuardarComo.addActionListener(new GuardarComoOyente());
        itemMenuCerrarArchivo.addActionListener(new CerrarArchivoOyente());
        itemMenuMostrarBarra.addActionListener(new MostrarBarraOyente());
        itemMenuSalir.addActionListener(new CerrarOyente());
        
        itemMenuNuevo.setMnemonic('N');
        itemMenuAbrir.setMnemonic('A');
        itemMenuGuardar.setMnemonic('G');
        itemMenuGuardarComo.setMnemonic('U');
        itemMenuCerrarArchivo.setMnemonic('C');
        itemMenuSalir.setMnemonic('S');
        
        itemMenuNuevo.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_N, Event.CTRL_MASK));
        itemMenuGuardar.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_S, Event.CTRL_MASK));
        
        itemMenuCortar = new JMenuItem("Cortar");
        itemMenuCopiar = new JMenuItem("Copiar");
        itemMenuPegar = new JMenuItem("Pegar");
        
        subMenuEditar.add(itemMenuCortar);
        subMenuEditar.add(itemMenuCopiar);
        subMenuEditar.add(itemMenuPegar);
        
        itemMenuCortar.addActionListener(new CortarOyente());
        itemMenuCopiar.addActionListener(new CopiarOyente());
        itemMenuPegar.addActionListener(new PegarOyente());
        
        itemMenuCortar.setMnemonic('C');
        itemMenuCopiar.setMnemonic('O');
        itemMenuPegar.setMnemonic('P');
        
        barra.add(subMenuArchivo);
        barra.add(subMenuEditar);
        
        setJMenuBar(barra);
        
        barraIconos = new JToolBar();
        
        botonNuevo = new JButton(new ImageIcon("resources" + File.separator + "iconoNuevo.jpg"));
        botonAbrir = new JButton(new ImageIcon("resources" + File.separator + "iconoAbrir.jpg"));
        botonGuardar = new JButton(new ImageIcon("resources" + File.separator + "iconoGuardar.jpg"));
        botonCopiar = new JButton(new ImageIcon("resources" + File.separator + "iconoCopiar.jpg"));
        botonCortar = new JButton(new ImageIcon("resources" + File.separator + "iconoCortar.jpg"));
        botonPegar = new JButton(new ImageIcon("resources" + File.separator + "iconoPegar.jpg"));
        
        barraIconos.add(botonNuevo);
        barraIconos.add(botonAbrir);
        barraIconos.add(botonGuardar);
        
        barraIconos.add(new JToolBar.Separator());
        
        barraIconos.add(botonCopiar);
        barraIconos.add(botonCortar);
        barraIconos.add(botonPegar);
        
        botonNuevo.addActionListener(new NuevoOyente());
        botonAbrir.addActionListener(new AbrirOyente());
        botonGuardar.addActionListener(new GuardarOyente());
        botonCopiar.addActionListener(new CopiarOyente());
        botonCortar.addActionListener(new CortarOyente());
        botonPegar.addActionListener(new PegarOyente());
        
        getContentPane().add(barraIconos, BorderLayout.NORTH);
        
        barraIconos.setVisible(false);
        
        areaTexto = new JTextArea();
        areaTexto.setBorder(BorderFactory.createLineBorder(Color.WHITE, 5));
        
        areaScroll = new JScrollPane(areaTexto);
        getContentPane().add(areaScroll);
        
        textoOriginal = "";
        
        setIconImage(new ImageIcon("resources" + File.separator + "icono.jpg").getImage());
        
        addWindowListener(new VentanaOyente());
        
        Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();
        setLocation(dim.width/2-this.getSize().width/2, dim.height/2-this.getSize().height/2);
        
        setVisible(true);
    }
    
    void guardar(boolean guardarComo) {
        boolean proseguirGuardando = true;

        if(guardarComo || !desdeArchivo) {
            proseguirGuardando = false;

            JFileChooser fileChooser = new JFileChooser();
            fileChooser.setFileFilter(filtroArchivosTexto);
            
            int seleccion = fileChooser.showSaveDialog(areaTexto);

            if (seleccion == JFileChooser.APPROVE_OPTION){
                fichero = fileChooser.getSelectedFile();

                if(fichero.exists()) {
                    int resultadoSobreescribir = JOptionPane.showConfirmDialog(null, "El fichero indicado ya existe. ¿Desea sobreescribirlo?", "Atención", JOptionPane.YES_NO_OPTION);
                    if (resultadoSobreescribir == JOptionPane.YES_OPTION) {
                        proseguirGuardando = true;
                    }
                } else {
                    proseguirGuardando = true;
                }
            }
        }

        if(proseguirGuardando) {
            textoAGuardar = areaTexto.getText();
            BufferedWriter outputWriter;
            try {
                outputWriter = new BufferedWriter(new FileWriter(fichero));
                outputWriter.write(textoAGuardar);
                outputWriter.close();

                textoOriginal = textoAGuardar;
                desdeArchivo = true;
                
                setTitle("Editor simple de textos. Editando: " + fichero.getAbsolutePath());
            } catch (IOException ex) {
                Logger.getLogger(Tarea7.class.getName()).log(Level.SEVERE, null, ex);
            }
        }   
    }
    
    boolean comprobarCambios() {
        boolean seguir = true;
        
        if(!areaTexto.getText().equals(textoOriginal)) {
            int resultadoComprobarCambios = JOptionPane.showConfirmDialog(null, "El texto contenido en el editor ha sufrido cambios que no han sido guardados a disco. ¿Desea continuar y descartarlos?", "Atención", JOptionPane.YES_NO_OPTION);
            if (resultadoComprobarCambios != JOptionPane.YES_OPTION) {
                seguir = false;
            }
        }
        
        return seguir;
    }
    
    void nuevo() {
        if(comprobarCambios()) {
            desdeArchivo = false;
            textoOriginal = "";
            areaTexto.setText("");
            
            setTitle("Editor simple de textos");
        }
    }
    
    void salir() {
        if(comprobarCambios()) {
            System.exit(0);
        }
    }

    class NuevoOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            nuevo();
        }
    }
    
    class AbrirOyente implements ActionListener {
        JFileChooser fileChooser;
        FileInputStream stream;
        InputStreamReader streamReader;
        String texto;
        int caracterLeido;
                
        @Override
        public void actionPerformed(ActionEvent e) {
            fileChooser = new JFileChooser();
            fileChooser.setFileFilter(filtroArchivosTexto);
            
            if(comprobarCambios()) {
                int seleccion = fileChooser.showOpenDialog(areaTexto);
            
                if (seleccion == JFileChooser.APPROVE_OPTION){
                    texto = "";

                    fichero = fileChooser.getSelectedFile();
                    try {
                        stream = new FileInputStream(fichero);

                        streamReader = new InputStreamReader(stream);
                        try {
                            while((caracterLeido = streamReader.read()) != -1) {
                                texto += (char)caracterLeido;
                            }

                            areaTexto.setText(texto);
                            textoOriginal = texto;
                            
                            setTitle("Editor simple de textos. Editando: " + fichero.getAbsolutePath());

                            desdeArchivo = true;
                        } catch (IOException ex) {
                            Logger.getLogger(Tarea7.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    } catch (FileNotFoundException ex) {
                        Logger.getLogger(Tarea7.class.getName()).log(Level.SEVERE, null, ex);
                    }
                } else if(seleccion == JFileChooser.ERROR_OPTION) {
                    System.out.println("Ha ocurrido un error.");
                }   
            }
        }
    }
    
    class GuardarOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            guardar(false);
        }
    }
    
    class GuardarComoOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            guardar(true);
        }
    }
    
    class CerrarArchivoOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            nuevo();
        }        
    }
    
    class MostrarBarraOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            barraIconos.setVisible(((JCheckBoxMenuItem)e.getSource()).getState());
        }
    }
    
    class CerrarOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            salir();
        }
    }

    class CortarOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            areaTexto.cut();
        } 
    }
    
    class CopiarOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            areaTexto.copy();
        } 
    }
    
    class PegarOyente implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            areaTexto.paste();
        }
    }
    
    class VentanaOyente implements WindowListener {
        @Override
        public void windowOpened(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void windowClosing(WindowEvent e) {
            salir();
        }

        @Override
        public void windowClosed(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void windowIconified(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void windowDeiconified(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void windowActivated(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void windowDeactivated(WindowEvent e) {
            //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }
    }
    
    public static void main (String[] args) {
        Tarea7 aplicacion = new Tarea7();
    }
}
