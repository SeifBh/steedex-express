<?php

namespace DemandeBundle\Controller;

use DemandeBundle\Entity\Demande;
use DemandeBundle\Form\AssignType;
use DemandeBundle\Form\DemandeType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use UserBundle\Entity\User;
use Spipu\Html2Pdf\Html2Pdf;


// Include Dompdf required namespaces
use Dompdf\Dompdf;
use Dompdf\Options;

class DefaultController extends Controller
{

    public function listAction()
    {
        $user = $this->getUser();
        $userId = $user->getId();
        $em = $this->getDoctrine()->getManager();
        /* if ($this->isGranted('ROLE_ADMIN')) {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();
         } else {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array('id_client'=>$userId));
         }
 */
        $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();


        return $this->render('@Demande/Default/index.html.twig', array(
            'listDemandes' => $listDemandes,
        ));

    }

    public function createAction(Request $request)
    {

        $user = $this->getUser();
        $userId = $user->getId();
        $demande = new Demande();

        $form = $this->createForm(DemandeType::class, $demande);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $demande->setEtat(false);
                $demande->setIdClient($user);
                $em->persist($demande);
                $em->flush();

                return $this->redirectToRoute("_list_demande");
            } else {
                $errors = $this->get('validator')->validate($demande);

                return $this->render('@Demande/Default/create.html.twig', array(
                    'errrs', $errors,
                    'form' => $form->createView()
                ));

            }


        }
        return $this->render('@Demande/Default/create.html.twig', array(
            'form' => $form->createView()
        ));


    }


    public function updateAction(Request $request, $id)
    {

        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository("DemandeBundle:Demande")->find($id);
        $form = $this->createForm(DemandeType::class, $demande);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em->persist($demande);
            $em->flush();
            return $this->redirectToRoute('_list_demande');
        }


        return $this->render("@User/Default/update.html.twig", array(
            'form' => $form->createView()
        ));

    }

    public function removeAction(Request $request, $id)
    {

        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository("DemandeBundle:Demande")->find($id);
        if ($demande != null) {
            $em->remove($demande);
            $em->flush();
        }

        return $this->redirectToRoute("_list_demande");
    }


    public function affecterAction(Request $request, $id_demande)
    {
        $demande = new Demande();

        $form = $this->createForm(AssignType::class, $demande);
        $form->handleRequest($request); /*creation d'une session pr stocker les valeurs de l'input*/
        if ($form->isSubmitted()) {
            $id_liveur = $request->get('id_livreur');
            return new Response($id_liveur);
        }

        $user = $this->getUser();
        $userId = $user->getId();
        $em = $this->getDoctrine()->getManager();
        /* if ($this->isGranted('ROLE_ADMIN')) {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findAll();
         } else {
             $listDemandes = $em->getRepository('DemandeBundle:Demande')->findBy(array('id_client'=>$userId));
         }
 */
        $listusers_livreur = $em->getRepository('UserBundle:User')->findByRole('ROLE_LIVREUR');
        $demande = $em->getRepository("DemandeBundle:Demande", $demande)->findBy(['id' => $id_demande]);


        return $this->render('@Demande/Default/assign.html.twig', array(
            'form' => $form->createView(),
            'demande' => $demande,
            'id_demande' => $id_demande,
            'listusers_livreur' => $listusers_livreur
        ));
    }


    public function confirmAssignAction(Request $request, $id_demande, $id_livreur)
    {

        $id_liveur = $request->get('id_livreur');
        $id_demande = $request->get('id_demande');
        $livreur = new User();
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $livreur = $em->getRepository('UserBundle:User')->findOneBy(array('id' => $id_livreur));
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));

        $demande->setIdLivreur($livreur);

        //$demande->setEtat(true);
        $em->persist($demande);
        $em->flush();

        return $this->redirectToRoute("_list_demande");


    }

    public function valideDemandeAction(Request $request, $id_demande)
    {


        $id_demande = $request->get('id_demande');
        //return new Response($id_demande);
        $demande = new Demande();
        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository('DemandeBundle:Demande')->findOneBy(array('id' => $id_demande));


        $demande->setEtat(true);
        $em->persist($demande);
        $em->flush();

        return $this->redirectToRoute("_list_demande");

    }


    public function generatepdfAction()
    {

        $html2pdf = new Html2Pdf();
        $html2pdf->writeHTML('<h1>HelloWorld</h1>This is my first test');
        $html2pdf->output();
    }
}